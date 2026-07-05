import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';

// Single source of truth for the webhook config — the SAME files written by the
// UI (App.js) and read by the native SmsReceiver. Avoids the previous drift where
// this task read AsyncStorage keys that were never set.
const WEBHOOK_FILE = FileSystem.documentDirectory + 'webhook.txt';
const WEBHOOK_TOKEN_FILE = FileSystem.documentDirectory + 'webhook_token.txt';

async function readTrimmed(path) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return '';
  const content = await FileSystem.readAsStringAsync(path);
  return content.trim();
}

module.exports = async (taskData) => {
  try {
    const { body, sender } = taskData;
    console.log('Background SMS Received from:', sender);

    const lowerBody = (body || '').toLowerCase();

    // PRIVACY: never forward OTP / verification / 2FA messages off the device.
    const otpMarkers = ['otp', 'one time password', 'one-time password', 'verification code',
      'verification pin', 'secret code', 'do not share', 'never share'];
    if (otpMarkers.some((m) => lowerBody.includes(m))) {
      console.log('OTP/verification message detected, ignoring');
      return;
    }

    // Only forward messages that clearly look like bank transaction alerts.
    const txnMarkers = ['credited', 'debited', 'credit', 'debit', 'spent', 'withdrawn',
      'paid', 'txn', 'a/c', 'acct'];
    if (!txnMarkers.some((m) => lowerBody.includes(m))) {
      console.log('Non-transactional SMS, ignoring');
      return;
    }

    const webhookUrl = await readTrimmed(WEBHOOK_FILE);
    const webhookToken = await readTrimmed(WEBHOOK_TOKEN_FILE);

    if (!webhookUrl) {
      console.log('Webhook URL not set, ignoring SMS');
      return;
    }
    if (!webhookToken) {
      console.log('Webhook token not set, ignoring SMS');
      return;
    }
    // Enforce HTTPS so SMS content is encrypted in transit.
    if (!webhookUrl.startsWith('https://')) {
      console.log('Webhook URL is not HTTPS, refusing to send');
      return;
    }

    // Send the SMS text to the backend for LLM parsing, authenticated with the token
    const response = await axios.post(
      webhookUrl,
      {
        sender,
        text: body,
        timestamp: new Date().toISOString()
      },
      { headers: { 'x-webhook-token': webhookToken } }
    );

    console.log('Successfully forwarded SMS:', response.data);
  } catch (error) {
    console.error('Error in background SMS task:', error.message);
  }
};
