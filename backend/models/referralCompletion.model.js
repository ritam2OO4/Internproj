const mongoose = require('mongoose');

const referralCompletionSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referralCode: {
    type: String,
    required: true
  },
  referrerEmail: {
    type: String,
    required: true
  },
  referredEmail: {
    type: String,
    required: true
  },
  purchaseAmount: {
    type: Number,
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Index to prevent multiple completions from same email in same campaign
referralCompletionSchema.index(
  { campaignId: 1, referredEmail: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('ReferralCompletion', referralCompletionSchema); 