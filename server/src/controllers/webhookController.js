const Transaction = require('../models/Transaction');

const handleSmsWebhook = async (req, res) => {
  try {
    const { sender, text, timestamp } = req.body;
    console.log(`[Webhook] SMS received from ${sender}: ${text}`);

    // In a full implementation, you would call your LLM here (e.g. Gemini/Groq)
    // to parse the "text" into amount, type, etc.
    // For now, we will create a pending transaction with the raw text as a note.
    
    // Mock LLM parsing (you can replace this with actual LLM API call)
    const amountMatch = text.match(/(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i) || text.match(/([\d,]+\.?\d*)\s*(?:rs\.?|inr)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    const type = text.toLowerCase().includes('credit') || text.toLowerCase().includes('credited') ? 'income' : 'expense';

    const newTransaction = new Transaction({
      amount: amount || 0,
      note: `SMS from ${sender}: ${text}`,
      type: type,
      status: 'pending',
      // We assume a default user for webhooks if auth isn't passed, 
      // or you can pass user ID in the webhook URL. 
      // For this single-user setup, we'll hardcode or fetch the first user.
      user: '000000000000000000000000', // To be replaced with actual user ID
      date: new Date(timestamp || Date.now())
    });

    // To make this work without auth middleware on webhook, 
    // we need to get the user ID. We'll try to find the first user.
    const User = require('../models/User');
    const defaultUser = await User.findOne();
    if (defaultUser) {
      newTransaction.user = defaultUser._id;
    }

    await newTransaction.save();
    console.log('[Webhook] Pending transaction saved successfully.');

    res.status(200).json({ success: true, message: 'SMS parsed and saved as pending transaction' });
  } catch (error) {
    console.error('[Webhook] Error processing SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { handleSmsWebhook };
