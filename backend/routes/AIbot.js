const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// System instruction embedded into the prompt
const SYSTEM_INSTRUCTION = "You are an AI assistant. Provide short, precise, and factual answers. Keep responses logical and to the point.";

const getAIResponse = async (userMessage, context) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${context}\n\nUser: ${userMessage}` }] }
            ],
            generationConfig: {
                temperature: 0.1,  // Very precise, minimizes randomness
                maxOutputTokens: 50,  // Controls response length
                topP: 0.6,  // Keeps responses within expected range
                topK: 40    // Ensures word relevance
            }
        });

        let botResponse = result.response.text().trim();

        // Ensure concise response (take the first sentence)
        if (botResponse.includes(".")) {
            botResponse = botResponse.split(".")[0] + ".";
        }

        return botResponse || "I’m not sure, can you clarify?";
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        return "Sorry, I couldn't process that.";
    }
};

// API Endpoint for Chatbot
router.post("/chat", async (req, res) => {
    const { userId, campaignId, message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required." });

    // Adjust context based on user query
    let context = `User ${userId} is completing campaign ${campaignId}. Provide precise answers to their questions.`;

    if (message.toLowerCase().includes("web development trends")) {
        context = "Summarize the latest web development trends in a few words.";
    }

    const botResponse = await getAIResponse(message, context);
    res.json({ response: botResponse });
});

module.exports = router;
