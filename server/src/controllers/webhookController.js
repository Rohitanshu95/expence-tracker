const Transaction = require('../models/Transaction');

const MAX_TEXT_LENGTH = 1000;
const MAX_SENDER_LENGTH = 100;

const handleSmsWebhook = async (req, res) => {
  try {
    const { sender, text, timestamp } = req.body;

    // Input validation — the payload is attacker-influenced (comes from arbitrary SMS).
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or missing "text"' });
    }
    if (sender !== undefined && typeof sender !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid "sender"' });
    }

    const safeText = text.slice(0, MAX_TEXT_LENGTH);
    const safeSender = (typeof sender === 'string' ? sender : 'Unknown').slice(0, MAX_SENDER_LENGTH);

    // The authenticated user is resolved by the webhookAuth middleware.
    const userId = req.webhookUser._id;

    // Mock LLM parsing (replace with a real LLM call as needed).
    const amountMatch =
      safeText.match(/(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i) ||
      safeText.match(/([\d,]+\.?\d*)\s*(?:rs\.?|inr)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    const lower = safeText.toLowerCase();
    const type = lower.includes('credit') || lower.includes('credited') ? 'income' : 'expense';

    let parsedDate = new Date();
    if (timestamp !== undefined && timestamp !== null) {
      const asNumber = Number(timestamp);
      const candidate = !Number.isNaN(asNumber) ? new Date(asNumber) : new Date(timestamp);
      if (!Number.isNaN(candidate.getTime())) {
        parsedDate = candidate;
      }
    }

    const newTransaction = new Transaction({
      amount: Number.isFinite(amount) ? amount : 0,
      note: `SMS from ${safeSender}: ${safeText}`,
      type,
      status: 'pending',
      user: userId,
      date: parsedDate,
    });

    await newTransaction.save();
    console.log(`[Webhook] Pending transaction saved for user ${userId}.`);

    res.status(200).json({ success: true, message: 'SMS parsed and saved as pending transaction' });
  } catch (error) {
    console.error('[Webhook] Error processing SMS:', error);
    res.status(500).json({ success: false, message: 'Error processing SMS' });
  }
};

module.exports = { handleSmsWebhook };
