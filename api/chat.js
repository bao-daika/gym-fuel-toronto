import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Cấm vào!" });

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Kiểm tra nhanh API Key
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "Key có vấn đề rồi Boss ơi!" });
    }

    try {
        const { message } = req.body;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Gọi thẳng model, không config rườm rà để tránh lỗi timeout
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are Toronto Fitness Boss. User: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });

    } catch (error) {
        console.error("LỖI THỰC TẾ ĐÂY:", error.message);
        // Trả về chính xác cái lỗi mà Google phản hồi
        return res.status(500).json({ reply: "Google nói: " + error.message });
    }
}