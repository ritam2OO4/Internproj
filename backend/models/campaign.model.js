const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rewardType: {
    type: String,
    enum: ['FIXED', 'PERCENTAGE'],
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true,
    min: 0
  },
  minRewardAmount: {
    type: Number,
    min: 0
  },
  maxRewardAmount: {
    type: Number,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  referralCount: {
    type: Number,
    default: 0
  },
  successfulReferrals: {
    type: Number,
    default: 0
  },
  totalRewardsGiven: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.minRewardAmount && this.maxRewardAmount && 
      this.minRewardAmount > this.maxRewardAmount) {
    next(new Error('Minimum reward amount cannot be greater than maximum reward amount'));
  }
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema); 