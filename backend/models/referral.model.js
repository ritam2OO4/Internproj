const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  completed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Referral', referralSchema);
