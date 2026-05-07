const express = require('express');
const { register, login, logout, getMe, updateProfile, changePassword, verifyPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.patch('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/verify-password', auth, verifyPassword);

module.exports = router;
