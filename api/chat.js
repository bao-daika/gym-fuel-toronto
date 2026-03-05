// api/chat.js
export default async function handler(req, res) {
    // 1. Chỉ chấp nhận POST
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: "Method not allowed, Boss!" });
    }

    try {
        // Đảm bảo req.body tồn tại (Vercel tự parse JSON nhưng thỉnh thoảng lỗi nếu header thiếu)
        const { message, gymData, dietData } = req.body || {};

        if (!message) {
            return res.status(400).json({ reply: "Say something, Boss!" });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
        if (!GEMINI_API_KEY) {
            console.error("Missing API KEY");
            return res.status(500).json({ reply: "Missing API Key in Vercel settings!" });
        }

        // 2. Prompt "Toronto Fitness Boss" của đại ca (Giữ nguyên cái hồn)
        const safeGymData = gymData ? JSON.stringify(gymData).substring(0, 2000) : "No gym data";
        const safeDietData = dietData ? JSON.stringify(dietData).substring(0, 2000) : "No diet data";

        const prompt = `
            You are "Toronto Fitness Boss", a witty and grounded mentor in downtown Toronto.
            Area: Bathurst, College, Front St West, Bay Street.
            Context: Gyms: ${safeGymData}. Diet: ${safeDietData}.
            Rules: Use English. Concise, street-smart tone. Mention local streets.
            User: "${message}"
        `;

        // 3. Gọi Google API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 4. Kiểm tra phản hồi từ Google cẩn thận
        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(500).json({ reply: "Gemini is busy. Try again, Boss!" });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "The streets are quiet. Try again!";

        // 5. Trả về đúng định dạng mà chatbot_ui.js đang chờ ({ reply: "..." })
        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("Vercel Crash:", error);
        return res.status(500).json({ reply: "Server crashed. The Boss is lifting heavy weights!" });
    }
}