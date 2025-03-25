const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an expert marketing assistant. Convert user input into a structured JSON campaign response.
    Ensure the response includes:
    - A valid campaign name.
    - A detailed and engaging campaign description, explaining the campaign purpose and benefits.
    - A specific rewardAmount (e.g., ₹5,000, ₹3,000, ₹7,000).
    - Active status as true.
    - Valid startDate and endDate in YYYY-MM-DD format.
    Output strictly as a valid JSON object with all fields fully populated.`

});

async function generateContent(userInput) {
    try {
        const prompt = typeof userInput === "string" ? userInput : JSON.stringify(userInput);

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        let responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error("No response received from AI.");
        }

        // ✅ Extract only the JSON part (if AI adds extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response.");
        }
        responseText = jsonMatch[0];

        // ✅ Convert JSON string to JavaScript object
        let campaignData;
        try {
            campaignData = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Error parsing JSON, attempting auto-fix...");

            // Fix missing double quotes on keys
            responseText = responseText.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

            // Fix trailing commas before closing braces
            responseText = responseText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

            campaignData = JSON.parse(responseText); // Try parsing again
        }
        // ✅ Extract required fields
        const campaign = {
            name: campaignData.campaignName,
            description: campaignData.campaignDescription,
            rewardAmount: campaignData.rewardAmount || "Specify reward if applicable",
            active: true,
            startDate: campaignData.campaignDuration?.startDate || "2024-01-01",
            endDate: campaignData.campaignDuration?.endDate || "2024-12-31"
        };

        return campaign;
    } catch (error) {
        console.error("Error in AI generation:", error);
        return { error: "Error generating campaign." };
    }
}

module.exports = generateContent;
