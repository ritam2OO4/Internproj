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
  rewardAmount: {
    type: Number,
    required: true,
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
  landingPage: {    //save the url
    type: String
  },
  sentTo: [{  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // ✅ Changed from 'Business' to 'User'
  }],
  completedCTA: [{
   type:Array   // ✅ Changed from 'Business' to 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically update `updatedAt` before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure `updatedAt` updates when using findOneAndUpdate
campaignSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
