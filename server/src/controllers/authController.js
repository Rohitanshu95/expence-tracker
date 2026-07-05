const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validateEmail, validateUsername, validatePassword } = require('../utils/validators');

// Precomputed hash used for timing-safe comparison when a login email is unknown,
// so an attacker cannot distinguish "no such user" from "wrong password" by timing.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing-safety', 12);

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input before doing any work (reject weak/malformed credentials).
    const validationError =
      validateUsername(username) || validateEmail(email) || validatePassword(password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    // Create default modules for the new user
    const Module = require('../models/Module');
    const defaultModules = [
      { name: 'Food', type: 'expense', icon: 'Utensils', color: '#ef4444' },
      { name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6' },
      { name: 'Salary', type: 'income', icon: 'Wallet', color: '#10b981' },
      { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#f59e0b' },
      { name: 'Housing', type: 'expense', icon: 'Home', color: '#6366f1' },
      { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#ec4899' },
      { name: 'Health', type: 'expense', icon: 'Heart', color: '#f43f5e' },
      { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#eab308' },
      { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
      { name: 'Other', type: 'expense', icon: 'Tag', color: '#94a3b8' }
    ];
    
    await Module.insertMany(defaultModules.map(m => ({ ...m, user: user._id })));

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim() });

    // Always run a bcrypt comparison (against a dummy hash when the user does not
    // exist) so response timing does not reveal whether an account exists.
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isPasswordCorrect = await bcrypt.compare(password, hashToCompare);

    // Single generic response for both "no such user" and "wrong password".
    if (!user || !isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Only true in production
      sameSite: "none", // 'none' requires 'secure'
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }); 
    // console.log(res.cookie)
    res.status(200).json({ result: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};


const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.id) {
        // Revoke outstanding tokens so the cleared cookie can't be replayed if it leaked.
        await User.updateOne(
          { _id: decoded.id },
          { $set: { tokenValidAfter: Math.floor(Date.now() / 1000) } }
        );
      }
    }
  } catch (e) {
    // Invalid/expired token — nothing to revoke; still clear the cookie below.
  }
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username && username !== user.username) {
      // Check if the new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }
    
    if (avatar) user.avatar = avatar;
    
    await user.save();

    res.status(200).json({ 
      message: 'Profile updated', 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        avatar: user.avatar
      } 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
      return res.status(400).json({ message: 'Current password is required' });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    // Revoke sessions issued before this second (a changed password should log out
    // other devices). The check is `iat < tokenValidAfter`, so the token re-issued
    // below — whose iat is this same second — remains valid (iat == cutoff).
    user.tokenValidAfter = Math.floor(Date.now() / 1000);
    await user.save();

    // Re-issue a token for the current session so this device stays logged in.
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Password verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Generates (or rotates) the per-user webhook token used by the SMS forwarder.
// Returns the token once, along with the full webhook URL to paste into the app.
const rotateWebhookToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.webhookToken = token;
    await user.save();

    const baseUrl =
      process.env.PUBLIC_API_URL ||
      `${req.protocol}://${req.get('host')}`;
    const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/webhooks/sms`;

    res.status(200).json({
      message: 'Webhook token generated. Copy it now — it will not be shown again.',
      webhookToken: token,
      webhookUrl,
    });
  } catch (error) {
    console.error('Rotate Webhook Token Error:', error);
    res.status(500).json({ message: 'Server error generating webhook token' });
  }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword, verifyPassword, rotateWebhookToken };
