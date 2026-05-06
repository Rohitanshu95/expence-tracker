const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
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
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ result: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
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
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    await user.save();

    res.status(200).json({ message: 'Profile updated', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

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
    res.status(500).json({ message: 'Server error during verification', error: error.message });
  }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword, verifyPassword };
