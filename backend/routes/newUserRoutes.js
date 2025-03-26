const router = require("express").Router();
const Campaign = require("../models/campaign.model");

router.post("/:campaignId", async (req, res) => {
    try {
        // const {  } = req.params;
        const {campaignId, token } = req.body; // Receive token from frontend (localStorage)

        console.log("Received Token:", token);

        if (token) {  
            console.log("Token exists, denying access.");
            return res.status(403).json({ message: "User already exists. Access denied." });
        }

        // Find campaign by ID
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        console.log("Sending campaign data.");
        res.json(campaign);
    } catch (error) {
        console.error("Error fetching campaign:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
