const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body; // User's input message
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(message);
        const responseText = result.response.text();

        res.json({ response: responseText });
    } catch (error) {
        console.error("Gemini Chatbot Error:", error);
        res.status(500).json({ error: "Something went wrong with AI processing." });
    }
});

module.exports = router;
