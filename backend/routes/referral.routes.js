const router = require('express').Router();
const Referral = require('../models/referral.model');
const Campaign = require('../models/campaign.model');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth.middleware');
const ReferralCompletion = require('../models/referralCompletion.model');

// Generate referral link - needs auth
router.post('/generate/:campaignId', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      // businessId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create a new referral with the referrer's email
    const referral = await Referral.create({
      campaignId: campaign._id,
      referralCode: crypto.randomBytes(6).toString('hex'),
      referrerEmail: req.body.email  // Store the email of the person sharing the link
    });

    // Update campaign referral count
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { referralCount: 1 }
    });

    // Return the referral link that can be shared
    res.status(201).json({
      referralCode: referral.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/refer/${referral.referralCode}`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Track referral completion - public route
router.post('/complete/:referralCode', async (req, res) => {
  try {
    const referral = await Referral.findOne({ 
      referralCode: req.params.referralCode,
      status: 'ACTIVE'
    });

    if (!referral) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Check if the referred email is already used in this campaign
    const existingReferral = await ReferralCompletion.findOne({
      campaignId: referral.campaignId,
      referredEmail: req.body.email,
    });

    if (existingReferral) {
      return res.status(400).json({ 
        error: 'This email has already been used for this campaign' 
      });
    }

    const campaign = await Campaign.findById(referral.campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.active) {
      return res.status(400).json({ error: 'This campaign is no longer active' });
    }

    // Validate purchase amount
    if (!req.body.purchaseAmount || req.body.purchaseAmount <= 0) {
      return res.status(400).json({ error: 'Invalid purchase amount' });
    }

    // Calculate reward
    const purchaseAmount = parseFloat(req.body.purchaseAmount);
    let rewardAmount;
    if (campaign.rewardType === 'FIXED') {
      rewardAmount = campaign.rewardAmount;
    } else {
      // For percentage rewards - calculate percentage of purchase amount
      rewardAmount = Number((purchaseAmount * (campaign.rewardAmount / 100)).toFixed(2));
      console.log('Percentage calculation:', {
        purchaseAmount,
        percentage: campaign.rewardAmount,
        calculation: `${purchaseAmount} * (${campaign.rewardAmount} / 100)`,
        result: rewardAmount
      });
    }

    // Add validation for minimum and maximum rewards if needed
    if (campaign.rewardType === 'PERCENTAGE') {
      // Ensure reward amount is within bounds
      if (campaign.maxRewardAmount && rewardAmount > campaign.maxRewardAmount) {
        rewardAmount = Number(campaign.maxRewardAmount.toFixed(2));
        console.log('Capped at max reward:', rewardAmount);
      }
      if (campaign.minRewardAmount && rewardAmount < campaign.minRewardAmount) {
        rewardAmount = Number(campaign.minRewardAmount.toFixed(2));
        console.log('Raised to min reward:', rewardAmount);
      }
    }

    // Validate calculated reward
    if (isNaN(rewardAmount) || rewardAmount < 0 || !isFinite(rewardAmount)) {
      return res.status(400).json({ error: 'Invalid reward calculation' });
    }

    // Create a completion record instead of a new referral
    const completionRecord = new ReferralCompletion({
      campaignId: referral.campaignId,
      referralCode: referral.referralCode,
      referrerEmail: referral.referrerEmail,
      referredEmail: req.body.email,
      purchaseAmount: purchaseAmount,
      rewardAmount: rewardAmount,
      completedAt: new Date()
    });
    await completionRecord.save();

    // Update campaign metrics
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { 
        successfulReferrals: 1,
        totalRewardsGiven: rewardAmount,
        totalPurchaseAmount: purchaseAmount
      }
    });

    // Get updated campaign stats
    const updatedCampaign = await Campaign.findById(campaign._id);
    console.log('Updated campaign metrics:', {
      successfulReferrals: updatedCampaign.successfulReferrals,
      totalRewardsGiven: updatedCampaign.totalRewardsGiven,
      totalPurchaseAmount: updatedCampaign.totalPurchaseAmount
    });

    res.json({ 
      referral: completionRecord,
      rewardAmount,
      purchaseAmount,
      calculationType: campaign.rewardType,
      calculationDetails: {
        rewardAmount: campaign.rewardAmount,
        percentage: campaign.rewardType === 'PERCENTAGE' ? campaign.rewardAmount : null
      }
    });
  } catch (error) {
    console.error('Referral completion error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get referral details - public route
router.get('/details/:referralCode', async (req, res) => {
  try {
    const referral = await Referral.findOne({ 
      referralCode: req.params.referralCode,
      status: 'ACTIVE'
    });

    if (!referral) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    if (referral.isExpired()) {
      referral.status = 'EXPIRED';
      await referral.save();
      return res.status(400).json({ error: 'This referral link has expired' });
    }

    const campaign = await Campaign.findOne({
      _id: referral.campaignId,
      active: true
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found or inactive' });
    }

    // Get completion stats for this referral
    const completions = await ReferralCompletion.countDocuments({
      referralCode: referral.referralCode
    });

    res.json({ 
      campaign, 
      referral,
      expiresAt: referral.expiresAt,
      totalCompletions: completions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 