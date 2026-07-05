const express = require('express');
const { handleSmsWebhook } = require('../controllers/webhookController');
const webhookAuth = require('../middleware/webhookAuth');
const { webhookLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// The SMS forwarder authenticates with a per-user webhook token (see webhookAuth).
// The token both authenticates the request and binds it to a specific user.
router.post('/sms', webhookLimiter, webhookAuth, handleSmsWebhook);

module.exports = router;
