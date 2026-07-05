const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  // Secret credential used to authenticate the SMS forwarder webhook and bind
  // incoming SMS to this specific user. Never expose in normal API responses.
  webhookToken: { type: String, unique: true, sparse: true, index: true, select: false },
  // Epoch seconds; any JWT issued (iat) before this value is treated as revoked.
  // Bumped on password change and logout to invalidate outstanding sessions.
  tokenValidAfter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
