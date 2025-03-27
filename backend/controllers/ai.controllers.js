const aiService = require("../services/ai.services")
const campaignModel = require("../models/campaign.model")
const { generateMail } = require("../services/ai.mail");

module.exports.getMail = async (req, res) => {
    try {
        const { campaignId } = req.body; // Extract campaign ID properly

        if (!campaignId) {
            return res.status(400).send("Campaign ID is required");
        }

        // Find the specific campaign linked to the authenticated business
        const campaign = await campaignModel.findOne({ _id: campaignId, businessId: req.user._id });

        if (!campaign) {
            return res.status(404).send("Campaign not found");
        }
// const users
        const landingPage = `${process.env.FRONTEND_URL}/campaign/${campaignId}`;
        await campaignModel.findOneAndUpdate(
            { _id: campaignId },
            { landingPage },
            { new: true }
        );                // Generate the AI-powered email
        const emailResponse = await generateMail({
            name: campaign.name,
            description: campaign.description,
            rewardAmount: campaign.rewardAmount,
            landingPage: campaign.landingPage || "https://your-campaign-url.com" // Ensure a valid URL
        });

        // console.log("Generated Email:", emailResponse);
        res.json(emailResponse); // Send the email response back
    } catch (error) {
        console.error("Error fetching email:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.getReview = async (req, res) => {

    const userInput = req.body;
    // console.log(userInput)

    if (!userInput) {
        return res.status(400).send("Prompt is required");
    }

    const response = await aiService(userInput);
    console.log(response)
    const { name, description, rewardAmount, active, startDate, endDate } = response;
    const campaign = await campaignModel.create({
        businessId: req.user._id,
        name,
        description,
        rewardAmount,
        active,
        startDate,
        endDate
    })
    res.send(campaign);
}