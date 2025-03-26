const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an expert email marketing assistant.  
Generate a concise and persuasive referral campaign email.  
Ensure the output is structured JSON with:  
- 'subject': A catchy subject line.  
- 'body': A brief introduction, key benefits, and a call-to-action with the campaign link.`  

});

/**
 * Generates an AI-powered marketing email.
 * @param {Object} campaign - The campaign details.
 * @param {string} campaign.name - The name of the campaign.
 * @param {string} campaign.description - The campaign description.
 * @param {string} campaign.rewardAmount - The reward offered.
 * @param {string} campaign.landingPage - The campaign referral link.
 * @returns {Promise<Object>} - The generated email { subject, body }.
 */
async function generateMail(campaign) {
    try {
        const userPrompt = `Generate an email for the following referral campaign:
        - Name: ${campaign.name}
        - Description: ${campaign.description}
        - Reward: ${campaign.rewardAmount}
        - Referral Link: ${campaign.landingPage}`;
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }]
        });

        let responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error("No response received from AI.");
        }

        // Extract JSON if AI includes extra text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response.");
        }
        responseText = jsonMatch[0];

        // Convert response to JSON object
        const emailData = JSON.parse(responseText);

        return {
            subject: emailData.subject || "Join Our Exclusive Referral Campaign!",
            body: emailData.body || "Be a part of something amazing! Click the link to learn more."
        };
    } catch (error) {
        console.error("Error generating email:", error);
        return { error: "Failed to generate email." };
    }
}

module.exports = { generateMail };
