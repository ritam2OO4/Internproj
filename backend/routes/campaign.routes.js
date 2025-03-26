const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign.model');
const authMiddleware = require('../middleware/auth.middleware');
const ReferralCompletion = require('../models/referralCompletion.model');
const Referral = require('../models/referral.model');

router.use(authMiddleware);

// 📌 Create a New Campaign
router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized access' });

    const campaign = await Campaign.create({ ...req.body, businessId: req.user._id });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get All Campaigns
router.post('/data', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ businessId: req.user._id });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update Campaign
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true }
    );
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Delete Campaign
router.delete('/:id', async (req, res) => {
  try {
    const deletedCampaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!deletedCampaign) return res.status(404).json({ error: 'Campaign not found' });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get Campaign Stats
router.get('/stats/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, businessId: req.user._id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const stats = await ReferralCompletion.aggregate([
      { $match: { campaignId: campaign._id } },
      { 
        $group: {
          _id: null,
          totalCompletions: { $sum: 1 },
          totalRewards: { $sum: '$rewardAmount' }
        }
      }
    ]);

    res.json({
      campaignId: campaign._id,
      name: campaign.name,
      successfulReferrals: stats[0]?.totalCompletions || 0,
      totalRewardsGiven: stats[0]?.totalRewards || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
