const express = require('express');
const router = express.Router();
const Referral = require('../models/referral.model');
const Campaign = require('../models/campaign.model');
const ReferralCompletion = require('../models/referralCompletion.model');
const User = require('../models/user.model'); // To check existing users
const crypto = require('crypto');

// 📌 Step 1: Generate a Referral Link (Existing User Shares It)
router.get('/generate/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign || !campaign.active) {
      return res.status(400).json({ error: 'Invalid or inactive campaign' });
    }

    // Generate a unique referral code
    const referralCode = crypto.randomBytes(6).toString('hex');

    // Save the referral entry
    const referral = await Referral.create({
      campaignId: campaign._id,
      referralCode
    });

    res.json({
      message: 'Referral link generated!',
      referralCode,
      referralLink: `${process.env.FRONTEND_URL}/refer/${referralCode}`
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Step 2: New User Completes Task (No Authentication Required)
router.post('/refer/:referralCode', async (req, res) => {
  try {
    const { email, purchaseAmount } = req.body;

    // Step 2.1: Ensure the user is NEW
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists. Referral not applicable.' });
    }

    // Step 2.2: Check if referral is valid
    const referral = await Referral.findOne({ referralCode: req.params.referralCode });
    if (!referral) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Step 2.3: Ensure campaign exists and is active
    const campaign = await Campaign.findById(referral.campaignId);
    if (!campaign || !campaign.active) {
      return res.status(400).json({ error: 'Campaign is inactive' });
    }

    // Step 2.4: Calculate the reward
    const amount = parseFloat(purchaseAmount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid purchase amount' });
    }

    let rewardAmount = campaign.rewardType === 'FIXED'
      ? campaign.rewardAmount
      : Math.min(Math.max(amount * (campaign.rewardAmount / 100), campaign.minRewardAmount || 0), campaign.maxRewardAmount || Infinity);

    if (isNaN(rewardAmount) || rewardAmount < 0) {
      return res.status(400).json({ error: 'Invalid reward calculation' });
    }

    // Step 2.5: Store the referral completion
    await ReferralCompletion.create({
      campaignId: referral.campaignId,
      referralCode: referral.referralCode,
      referrerEmail: referral.referrerEmail,
      referredEmail: email,
      purchaseAmount: amount,
      rewardAmount,
      completedAt: new Date()
    });

    // Step 2.6: Mark referral as completed
    referral.completed = true;
    referral.referredEmail = email;
    await referral.save();

    // Step 2.7: Update campaign stats
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { successfulReferrals: 1, totalRewardsGiven: rewardAmount, totalPurchaseAmount: amount }
    });

    res.json({
      message: 'Referral successful! Both referrer and you are rewarded.',
      rewardAmount
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
