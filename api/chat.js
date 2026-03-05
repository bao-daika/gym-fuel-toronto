import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào, Boss!" });

    try {
        const { message, gymData, dietData } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Sử dụng model 1.5-flash (nhanh, rẻ, phù hợp clone AI)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are "Toronto Fitness Boss", an authentic clone of Gemini AI built for the Toronto gym community.
            Your territory: Bathurst, College, Front St West, Bay street.
            Context: I have some local gym data: ${JSON.stringify(gymData).substring(0, 1000)}.
            Style: Witty, supportive, street-smart.
            User's request: ${message}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        return res.status(500).json({ reply: "Lỗi kết nối rồi, có thể do API Key hoặc Model name. Check log Vercel đi đại ca!" });
    }
}