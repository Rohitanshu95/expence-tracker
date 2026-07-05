import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, PermissionsAndroid, Alert, TouchableOpacity, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const WEBHOOK_FILE = FileSystem.documentDirectory + 'webhook.txt';
const WEBHOOK_TOKEN_FILE = FileSystem.documentDirectory + 'webhook_token.txt';

export default function App() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const smsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
      setHasPermission(smsGranted);

      // Request Notification permission for Foreground Service (Android 13+)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const loadSettings = async () => {
    try {
      const info = await FileSystem.getInfoAsync(WEBHOOK_FILE);
      if (info.exists) {
        const url = await FileSystem.readAsStringAsync(WEBHOOK_FILE);
        setWebhookUrl(url.trim());
      }
      const tokenInfo = await FileSystem.getInfoAsync(WEBHOOK_TOKEN_FILE);
      if (tokenInfo.exists) {
        const token = await FileSystem.readAsStringAsync(WEBHOOK_TOKEN_FILE);
        setWebhookToken(token.trim());
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = async () => {
    try {
      const url = webhookUrl.trim();
      // Enforce HTTPS so the (potentially sensitive) SMS content is encrypted in transit.
      if (!url.startsWith('https://')) {
        Alert.alert('Insecure URL', 'The webhook URL must start with https:// to protect your SMS data.');
        return;
      }
      if (!webhookToken.trim()) {
        Alert.alert('Missing token', 'Please paste the webhook token generated in your account settings.');
        return;
      }
      await FileSystem.writeAsStringAsync(WEBHOOK_FILE, url);
      await FileSystem.writeAsStringAsync(WEBHOOK_TOKEN_FILE, webhookToken.trim());
      Alert.alert('Success', 'Webhook URL and token saved. The background task will use these to authenticate.');
    } catch (e) {
      Alert.alert('Error', `Failed to save settings: ${e.message || JSON.stringify(e)}`);
    }
  };


  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS to forward transaction alerts to your backend.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
        Alert.alert('Permission Granted', 'The app can now listen for SMS in the background.');
      } else {
        setHasPermission(false);
        Alert.alert('Permission Denied', 'The app cannot function without SMS permissions.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMS Forwarder</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Backend Webhook URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://your-server.com/api/v1/webhooks/sms"
          value={webhookUrl}
          onChangeText={setWebhookUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.label}>Webhook Token</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste token from account settings"
          value={webhookToken}
          onChangeText={setWebhookToken}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Button title="Save Settings" onPress={saveSettings} color="#007BFF" />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.statusText}>
          SMS Permission: {hasPermission ? '✅ Granted' : '❌ Denied'}
        </Text>
        {!hasPermission && (
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
