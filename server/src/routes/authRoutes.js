const express = require('express');
const { register, login, logout, getMe, updateProfile, changePassword, verifyPassword, rotateWebhookToken } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.patch('/profile', auth, updateProfile);
router.post('/change-password', authLimiter, auth, changePassword);
router.post('/verify-password', authLimiter, auth, verifyPassword);
router.post('/webhook-token', auth, rotateWebhookToken);

module.exports = router;
