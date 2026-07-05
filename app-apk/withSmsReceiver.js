const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withSmsManifest(config) {
  return withAndroidManifest(config, async config => {
    const androidManifest = config.modResults;

    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    
    const permissions = [
      // RECEIVE_SMS is sufficient to receive incoming SMS broadcasts. READ_SMS
      // (access to the full SMS inbox) is intentionally NOT requested.
      'android.permission.RECEIVE_SMS',
      'android.permission.INTERNET',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'
    ];
    
    for (const perm of permissions) {
      if (!androidManifest.manifest['uses-permission'].some(p => p.$['android:name'] === perm)) {
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': perm }
        });
      }
    }

    const application = androidManifest.manifest.application[0];
    // Block plain-HTTP traffic — SMS content (incl. bank alerts) must only leave
    // the device over HTTPS. The webhook URL is validated to be https:// as well.
    application.$['android:usesCleartextTraffic'] = 'false';

    // Add Services
    if (!application.service) {
      application.service = [];
    }
    
    if (!application.service.some(s => s.$['android:name'] === '.SmsForegroundService')) {
      application.service.push({
        $: {
          'android:name': '.SmsForegroundService',
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'dataSync'
        }
      });
    }

    // Add Receivers
    if (!application.receiver) {
      application.receiver = [];
    }
    
    if (!application.receiver.some(r => r.$['android:name'] === '.SmsReceiver')) {
      application.receiver.push({
        $: {
          'android:name': '.SmsReceiver',
          'android:enabled': 'true',
          'android:exported': 'true'
        },
        'intent-filter': [{
          action: [{ $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }]
        }]
      });
    }

    if (!application.receiver.some(r => r.$['android:name'] === '.BootReceiver')) {
      application.receiver.push({
        $: {
          'android:name': '.BootReceiver',
          'android:enabled': 'true',
          'android:exported': 'true'
        },
        'intent-filter': [{
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            { $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } }
          ]
        }]
      });
    }

    return config;
  });
}

function withSmsJavaFiles(config) {
  return withDangerousMod(config, [
    'android',
    async config => {
      const androidPackage = config.android.package;
      if (!androidPackage) {
        throw new Error('Android package must be defined in app.json');
      }

      const projectRoot = config.modRequest.projectRoot;
      const srcPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        ...androidPackage.split('.')
      );

      // 1. SmsForegroundService.java
      const serviceCode = `package ${androidPackage};

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

public class SmsForegroundService extends Service {
    private static final String CHANNEL_ID = "SmsForwarderChannel";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("SMS Forwarder")
                .setContentText("Actively listening for SMS in background...")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .build();

        startForeground(1, notification);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // KEEP ALIVE
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "SMS Listener Service Channel",
                    NotificationManager.IMPORTANCE_MIN
            );
            serviceChannel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
`;
      fs.writeFileSync(path.join(srcPath, 'SmsForegroundService.java'), serviceCode);

      // 2. BootReceiver.java
      const bootReceiverCode = `package ${androidPackage};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) || 
            "android.intent.action.QUICKBOOT_POWERON".equals(intent.getAction())) {
            
            Intent serviceIntent = new Intent(context, SmsForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        }
    }
}
`;
      fs.writeFileSync(path.join(srcPath, 'BootReceiver.java'), bootReceiverCode);

      const receiverCode = `package ${androidPackage};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Build;
import android.telephony.SmsMessage;
import android.util.Log;
import android.widget.Toast;
import android.os.Handler;
import android.os.Looper;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiverNative";

    @Override
    public void onReceive(final Context context, Intent intent) {
        if (!"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) return;

        // Ensure Foreground Service is running to keep process alive
        Intent serviceIntent = new Intent(context, SmsForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try { context.startForegroundService(serviceIntent); } catch(Exception e){}
        } else {
            try { context.startService(serviceIntent); } catch(Exception e){}
        }

        Bundle extras = intent.getExtras();
        if (extras == null) return;

        Object[] pdus = (Object[]) extras.get("pdus");
        if (pdus == null) return;

        StringBuilder bodyBuilder = new StringBuilder();
        String sender = "";
        for (Object pdu : pdus) {
            SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
            bodyBuilder.append(smsMessage.getMessageBody());
            sender = smsMessage.getOriginatingAddress();
        }

        final String finalBody = bodyBuilder.toString();
        final String finalSender = sender;

        String lowerBody = finalBody.toLowerCase();

        // PRIVACY: never forward OTP / verification / 2FA messages off the device.
        if (lowerBody.contains("otp") || lowerBody.contains("one time password") ||
            lowerBody.contains("one-time password") || lowerBody.contains("verification code") ||
            lowerBody.contains("verification pin") || lowerBody.contains("secret code") ||
            lowerBody.contains("do not share") || lowerBody.contains("never share") ||
            lowerBody.contains("otp is")) {
            return;
        }

        // FILTER: only forward messages that clearly look like bank transaction alerts.
        // (Bare "rs"/"inr" substring matching was removed — it matched words like "hours".)
        boolean looksTransactional =
            lowerBody.contains("credited") || lowerBody.contains("debited") ||
            lowerBody.contains("credit") || lowerBody.contains("debit") ||
            lowerBody.contains("spent") || lowerBody.contains("withdrawn") ||
            lowerBody.contains("paid") || lowerBody.contains("txn") ||
            lowerBody.contains("a/c") || lowerBody.contains("acct");
        if (!looksTransactional) {
            return;
        }

        File webhookFile = new File(context.getFilesDir(), "webhook.txt");
        if (!webhookFile.exists()) {
            showToast(context, "URL missing! Please save URL in app.");
            return;
        }

        StringBuilder urlBuilder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(webhookFile))) {
            String line;
            while ((line = reader.readLine()) != null) urlBuilder.append(line);
        } catch (Exception e) { 
            showToast(context, "Error reading file.");
            return; 
        }

        final String webhookUrl = urlBuilder.toString().trim();
        if (webhookUrl.isEmpty()) return;

        // Enforce HTTPS so SMS content is encrypted in transit (cleartext is also
        // blocked at the manifest level, but fail loudly here instead of silently).
        if (!webhookUrl.toLowerCase().startsWith("https://")) {
            showToast(context, "Webhook URL must use HTTPS. Update it in the app.");
            return;
        }

        // Read the per-user webhook token used to authenticate with the backend.
        String tokenValue = "";
        File tokenFile = new File(context.getFilesDir(), "webhook_token.txt");
        if (tokenFile.exists()) {
            StringBuilder tokenBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new FileReader(tokenFile))) {
                String line;
                while ((line = reader.readLine()) != null) tokenBuilder.append(line);
            } catch (Exception e) { /* fall through with empty token */ }
            tokenValue = tokenBuilder.toString().trim();
        }
        if (tokenValue.isEmpty()) {
            showToast(context, "Webhook token missing! Please save it in the app.");
            return;
        }
        final String webhookToken = tokenValue;

        showToast(context, "Forwarding SMS to server...");

        final PendingResult pendingResult = goAsync();
        new Thread(() -> {
            try {
                URL url = new URL(webhookUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("x-webhook-token", webhookToken);
                conn.setDoOutput(true);

                // Build JSON with a real serializer so any characters in the SMS
                // body (quotes, newlines, backslashes, unicode) are escaped correctly.
                org.json.JSONObject payload = new org.json.JSONObject();
                payload.put("sender", finalSender);
                payload.put("text", finalBody);
                payload.put("timestamp", String.valueOf(System.currentTimeMillis()));
                String jsonPayload = payload.toString();

                try(OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonPayload.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
                
                int code = conn.getResponseCode();
                showToast(context, "Sent! Response: " + code);
            } catch (Throwable e) {
                showToast(context, "Failed: " + e.toString());
            } finally {
                pendingResult.finish();
            }
        }).start();
    }

    private void showToast(final Context context, final String message) {
        new Handler(Looper.getMainLooper()).post(() -> 
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        );
    }
}
`;
      fs.writeFileSync(path.join(srcPath, 'SmsReceiver.java'), receiverCode);

      return config;
    }
  ]);
}

module.exports = function withSmsPlugin(config) {
  config = withSmsManifest(config);
  config = withSmsJavaFiles(config);
  return config;
};
