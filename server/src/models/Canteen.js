const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lunchRemaining: {
    type: Number,
    default: 30
  },
  dinnerRemaining: {
    type: Number,
    default: 30
  },
  totalLunch: {
    type: Number,
    default: 30
  },
  totalDinner: {
    type: Number,
    default: 30
  },
  history: [{
    mealType: {
      type: String,
      enum: ['lunch', 'dinner'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  archives: [{
    label: String,
    lunchUsed: Number,
    dinnerUsed: Number,
    startDate: Date,
    endDate: Date,
    history: [{
      mealType: String,
      date: Date
    }]
  }],
  lastRenewed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Canteen', canteenSchema);
