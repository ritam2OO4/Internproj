const aiService = require("../services/ai.services")
const campaignModel = require("../models/campaign.model")

module.exports.getReview = async (req, res) => {

    const userInput = req.body;
    // console.log(userInput)

    if (!userInput) {
        return res.status(400).send("Prompt is required");
    }

    const response = await aiService(userInput);
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