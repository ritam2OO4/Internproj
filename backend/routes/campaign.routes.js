const router = require('express').Router();
const Campaign = require('../models/campaign.model');
const authMiddleware = require('../middleware/auth.middleware');
const ReferralCompletion = require('../models/referralCompletion.model');
const Referral = require('../models/referral.model');

// Apply auth middleware to all campaign routes
router.use(authMiddleware);

// Create new campaign
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const campaign = await Campaign.create({
      ...req.body,
      businessId: req.user._id
    });
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all campaigns for the business
router.get('/campaignsList', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const campaigns = await Campaign.find({ businessId: req.user._id });
    res.json(campaigns);
  } catch (error) {
    console.error('Campaign list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    await Campaign.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get campaign statistics
router.get('/stats/:campaignId', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      businessId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get completion statistics
    const completions = await ReferralCompletion.aggregate([
      { $match: { campaignId: campaign._id } },
      { 
        $group: {
          _id: null,
          totalCompletions: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' },
          totalPurchases: { $sum: '$purchaseAmount' },
          avgPurchaseAmount: { $avg: '$purchaseAmount' }
        }
      }
    ]);

    const stats = completions[0] || {
      totalCompletions: 0,
      totalRewards: 0,
      totalPurchases: 0,
      avgPurchaseAmount: 0
    };

    // Get referral count
    const referralCount = await Referral.countDocuments({
      campaignId: campaign._id
    });

    res.json({
      campaignId: campaign._id,
      name: campaign.name,
      referralCount,
      successfulReferrals: stats.totalCompletions,
      totalRewardsGiven: Number(stats.totalRewards.toFixed(2)),
      totalPurchaseAmount: Number(stats.totalPurchases.toFixed(2)),
      averagePurchaseAmount: Number(stats.avgPurchaseAmount.toFixed(2))
    });
  } catch (error) {
    console.error('Campaign stats error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 