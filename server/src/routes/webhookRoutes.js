const express = require('express');
const { handleSmsWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Webhook endpoint does not require auth middleware because the SMS forwarder app
// might not have the user's JWT token. We handle user association in the controller.
router.post('/sms', handleSmsWebhook);

module.exports = router;
