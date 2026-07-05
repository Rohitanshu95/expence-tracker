const User = require('../models/User');

// Authenticates the SMS forwarder webhook using a per-user secret token.
// The token can be supplied either as `Authorization: Bearer <token>` or as an
// `x-webhook-token` header. The matched user is attached as req.webhookUser so
// the controller can bind the transaction to the correct account.
const webhookAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const token = bearer || req.headers['x-webhook-token'];

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, message: 'Missing webhook token' });
    }

    // webhookToken has select:false, so request it explicitly.
    const user = await User.findOne({ webhookToken: token }).select('_id webhookToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid webhook token' });
    }

    req.webhookUser = user;
    next();
  } catch (error) {
    console.error('[WebhookAuth] Error:', error);
    return res.status(401).json({ success: false, message: 'Webhook authentication failed' });
  }
};

module.exports = webhookAuth;
