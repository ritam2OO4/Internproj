const router = require("express").Router();
const Campaign = require("../models/campaign.model");
const User = require("../models/user.model"); // Assuming you have a User model

router.post("/submit", async (req, res) => {
    try {
        const { campaignId, userId } = req.body;

        // ✅ Basic validation
        if (!campaignId || !userId) {
            return res.status(400).json({ error: "Campaign ID and User ID are required." });
        }

        // ✅ Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found." });
        }

        // ✅ Ensure rewardAmount exists in campaign
        if (typeof campaign.rewardAmount !== "number" || campaign.rewardAmount < 0) {
            return res.status(400).json({ error: "Invalid reward amount in campaign." });
        }

        // ✅ Extract `sentTo` user IDs
        const userIds = campaign.sentTo; // Assuming sentTo is an array of user IDs
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "No users found in sentTo." });
        }

        // ✅ Iterate over user IDs and update each one
        await Promise.all(
            userIds.map(async (id) => {
               const user= await User.findByIdAndUpdate(id, { $inc: { rewardAmount: campaign.rewardAmount } });
              console.log(user)
               user.save()
            })
        );

        // ✅ Add `userId` to `completedCTA` array
        if (!campaign.completedCTA.includes(userId)) {
            campaign.completedCTA.push(userId);
            await campaign.save();
        }

        res.status(200).json({ message: "Task completed! Referral amounts updated for users." });
    } catch (error) {
        console.error("Error processing task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
