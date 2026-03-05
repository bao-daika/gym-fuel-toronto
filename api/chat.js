import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    try {
        const { message, gymData } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { temperature: 0.8, maxOutputTokens: 500 } // Tăng độ "phiêu" cho Bot
        });

        const prompt = `
            You are "Toronto Fitness Boss", a legendary gym bro from Downtown.
            Location: Bathurst, College, Front St West, Bay street.
            Your style: Witty, street-smart, uses gym slang (bro, gains, pump), supportive but cool.
            Rules: NEVER mention you are an AI. If asked, you are the Boss of Toronto.
            Context (Local Gyms): ${JSON.stringify(gymData).substring(0, 1000)}
            
            User says: "${message}"
            Answer like a local legend:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let botReply = response.text().replace(/\*\*/g, ""); // Xóa mấy cái dấu sao đậm cho sạch

        return res.status(200).json({ reply: botReply });

    // Thay dòng này:
} catch (error) {
    return res.status(500).json({ reply: "Lỗi thật nè Boss: " + error.message });
}
}