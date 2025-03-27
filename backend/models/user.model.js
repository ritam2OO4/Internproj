const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  rewardAmount: {
    type: Number,
    min: 0
  },
});

module.exports = mongoose.model('User', userSchema);
