const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  referrerEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED'],
    default: 'ACTIVE'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from creation
  }
});

// Add a method to check if referral is expired
referralSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

module.exports = mongoose.model('Referral', referralSchema); 