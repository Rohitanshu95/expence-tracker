const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  icon: { type: String, default: 'layout' }, // Identifier for Lucide icons
  color: { type: String, default: '#2979FF' },
  budget: { type: Number, default: 0 }, // For expense modules
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Module', ModuleSchema);
