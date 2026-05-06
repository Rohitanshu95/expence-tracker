const mongoose = require('mongoose');

const KhataTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gave', 'got'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const KhataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  partyType: {
    type: String,
    enum: ['customer', 'supplier'],
    default: 'customer'
  },
  gstin: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  transactions: [KhataTransactionSchema],
  netBalance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save hook to calculate net balance
// Balance = Sum(gave) - Sum(got)
// Positive: Friend owes you. Negative: You owe friend.
KhataSchema.pre('save', async function() {
  if (this.transactions) {
    this.netBalance = this.transactions.reduce((acc, tx) => {
      return tx.type === 'gave' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }
});

module.exports = mongoose.model('Khata', KhataSchema);
