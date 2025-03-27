const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const SYSTEM_INSTRUCTION = "You are an AI assistant helping users complete a task to redeem rewards. Guide them through step-by-step verification.";

// Function to get AI Response
const getAIResponse = async (userMessage, context) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${context}\n\nUser: ${userMessage}` }] }]
        });

        let botResponse = result.response.text().trim();
        return botResponse || "I’m not sure, can you clarify?";
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        return "Sorry, I couldn't process that.";
    }
};

// Step-based Task Completion API
router.post("/completeTaskWithAI", async (req, res) => {
    const { userId, campaignId, userMessage, step } = req.body;

    if (!userMessage) return res.status(400).json({ error: "Message is required." });

    let context = `User ${userId} is completing a campaign task ${campaignId}. Guide them through step-by-step verification.`; 
    let responseMessage = "";

    switch (step) {
        case 1:
            responseMessage = "Let's have a quick task to redeem your reward! Please type 'start' to begin.";
            break;
        case 2:
            if (userMessage.toLowerCase() === "start") {
                responseMessage = "Great! What's your name?";
            } else {
                responseMessage = "Please type 'start' to begin.";
            }
            break;
        case 3:
            responseMessage = `Nice to meet you, ${userMessage}! Now, enter your 10-digit phone number.`;
            break;
        case 4:
            if (!/^\d{10}$/.test(userMessage)) {
                responseMessage = "❌ Invalid number! It must be exactly 10 digits with no letters.";
            } else {
                responseMessage = "✅ Perfect! Which city are you from?";
            }
            break;
        case 5:
            responseMessage = `Thanks! Now, tell me your preferences. Any favorite brands or products you like?`;
            break;
        case 6:
            responseMessage = "🎉 Awesome! You have completed the task successfully. You will receive your reward soon!";
            break;
        default:
            responseMessage = "I didn't understand that. Let's try again.";
    }

    res.json({ response: responseMessage });
});

module.exports = router;
