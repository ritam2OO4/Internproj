const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: String,
  referrerId: {  // Tracks who invited this business
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null
  },
  campaignsParticipated: [{  // Tracks campaigns the business was part of
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Business', businessSchema); 