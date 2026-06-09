import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, PermissionsAndroid, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

const WEBHOOK_FILE = FileSystem.documentDirectory + 'webhook.txt';

export default function App() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const info = await FileSystem.getInfoAsync(WEBHOOK_FILE);
      if (info.exists) {
        const url = await FileSystem.readAsStringAsync(WEBHOOK_FILE);
        setWebhookUrl(url.trim());
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = async () => {
    try {
      await FileSystem.writeAsStringAsync(WEBHOOK_FILE, webhookUrl);
      Alert.alert('Success', 'Webhook URL saved successfully! The background task will use this URL.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save URL');
    }
  };

  const checkPermissions = async () => {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
    setHasPermission(granted);
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
          placeholder="http://your-server-ip:5000/api/v1/webhooks/sms"
          value={webhookUrl}
          onChangeText={setWebhookUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button title="Save URL" onPress={saveSettings} color="#007BFF" />
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
