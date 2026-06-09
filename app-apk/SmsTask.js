import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

module.exports = async (taskData) => {
  try {
    const { body, sender } = taskData;
    console.log('Background SMS Received from:', sender);

    // Filter to ensure we only process likely bank messages
    // (Optional: You can add specific logic here based on sender name)
    // if (!sender.toLowerCase().includes('bank')) return;

    // Get the webhook URL configured by the user
    const webhookUrl = await AsyncStorage.getItem('WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log('Webhook URL not set, ignoring SMS');
      return;
    }

    // Send the SMS text to the backend for LLM parsing
    const response = await axios.post(webhookUrl, {
      sender,
      text: body,
      timestamp: new Date().toISOString()
    });

    console.log('Successfully forwarded SMS:', response.data);
  } catch (error) {
    console.error('Error in background SMS task:', error.message);
  }
};
