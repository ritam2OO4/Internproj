const express = require("express");
const campaignModel = require("../models/campaign.model");
const User = require("../models/user.model");

const router = express.Router();

// Fetch users and update the campaign's sentTo field
router.post("/users", async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).send({ message: "Campaign ID is required." });
    }

    // Find the campaign
    const campaign = await campaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).send({ message: "Campaign not found." });
    }

    // Fetch all users
    const users = await User.find({}, "name email");
    if (!users || users.length === 0) {
      return res.status(404).send({ message: "No users found." });
    }
    // Update campaign's sentTo field for each user
    const userIds = users.map((user) => user._id); // Extract user IDs
    await campaignModel.findByIdAndUpdate(
      campaignId,
      { $addToSet: { sentTo: { $each: userIds } } }, // Prevents duplicates
      { new: true }
    );

    res.send({ message: "Users fetched and campaign updated!", users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

module.exports = router;
