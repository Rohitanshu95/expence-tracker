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
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_SMS',
      'android.permission.INTERNET'
    ];
    
    for (const perm of permissions) {
      if (!androidManifest.manifest['uses-permission'].some(p => p.$['android:name'] === perm)) {
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': perm }
        });
      }
    }

    const application = androidManifest.manifest.application[0];
    application.$['android:usesCleartextTraffic'] = 'true';

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

    // Clean up old Headless JS service if it was added previously
    if (application.service) {
      application.service = application.service.filter(s => s.$['android:name'] !== '.SmsTaskService');
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

      // Create SmsReceiver.java for pure native HTTP
      const receiverCode = `package ${androidPackage};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiverNative";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) return;

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

        // Read Webhook URL from expo-file-system
        File webhookFile = new File(context.getFilesDir(), "webhook.txt");
        if (!webhookFile.exists()) {
            Log.e(TAG, "webhook.txt does not exist. Please save URL in the app.");
            return;
        }

        StringBuilder urlBuilder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(webhookFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                urlBuilder.append(line);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading webhook URL", e);
            return;
        }

        final String webhookUrl = urlBuilder.toString().trim();
        if (webhookUrl.isEmpty()) return;

        // Fire HTTP POST in a background thread
        final PendingResult pendingResult = goAsync();
        new Thread(() -> {
            try {
                URL url = new URL(webhookUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setDoOutput(true);

                String jsonPayload = String.format(
                    "{\\"sender\\":\\"%s\\", \\"text\\":\\"%s\\", \\"timestamp\\":\\"%s\\"}",
                    finalSender.replace("\\"", "\\\\\\""),
                    finalBody.replace("\\"", "\\\\\\"").replace("\\n", "\\\\n"),
                    new java.util.Date().toInstant().toString()
                );

                try(OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonPayload.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.d(TAG, "Webhook sent! Response Code: " + code);

            } catch (Exception e) {
                Log.e(TAG, "Failed to send webhook", e);
            } finally {
                pendingResult.finish();
            }
        }).start();
    }
}
`;
      fs.writeFileSync(path.join(srcPath, 'SmsReceiver.java'), receiverCode);

      // Clean up old service file if it exists
      const oldServicePath = path.join(srcPath, 'SmsTaskService.java');
      if (fs.existsSync(oldServicePath)) {
        fs.unlinkSync(oldServicePath);
      }

      return config;
    }
  ]);
}

module.exports = function withSmsPlugin(config) {
  config = withSmsManifest(config);
  config = withSmsJavaFiles(config);
  return config;
};
