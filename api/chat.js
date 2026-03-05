// api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: "Method not allowed, Boss!" });
    }

    try {
        const { message, gymData, dietData } = req.body || {};
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Lỗi rồi đại ca! Anh chưa add API Key vào Vercel." });
        }

        // --- DÙNG THƯ VIỆN AI CHÍNH THỨC ---
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const safeGym = gymData ? JSON.stringify(gymData).substring(0, 1500) : "No data";
        const safeDiet = dietData ? JSON.stringify(dietData).substring(0, 1500) : "No data";

        const prompt = `
            You are "Toronto Fitness Boss". 
            Territory: Bathurst, College, Front St West, Bay Street.
            Context: Gyms: ${safeGym}. Diet: ${safeDiet}.
            Rules: Use English. Be witty, concise, street-smart. Mention local streets.
            User Message: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const botReply = response.text();

        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("AI Error:", error);
        return res.status(500).json({ reply: "The Boss is busy lifting weights. Try again later!" });
    }
}