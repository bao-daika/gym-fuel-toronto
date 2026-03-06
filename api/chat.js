export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied!" });

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "API Key Error. Contact Admin, Boss!" });
    }

    const { message, gymData, dietData } = req.body;

    // Sử dụng Model 3.1 Flash-Lite (Best of 2026) via Fetch để né lỗi SDK cũ
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemInstruction = `
    Your name is "Toronto Fitness Boss". 

    GREETING RULE:
    - ONLY introduce yourself with the full phrase: "Hello, I am the Toronto Fitness Boss! I'm smarter than ChatGPT and Gemini about Fitness in Downtown Toronto. How can I help you?" at the VERY BEGINNING.
    - After that, KEEP ANSWERS SHORT, sweet, and direct.

    IDENTITY:
    - You are a friendly, professional Fitness Trainer for the **Downtown Toronto Core**.
    - Focus on the area broadly unless specific street names (Bathurst, College, Front St West, Bay St) are needed for directions.

    APP DATA (Your Secret Weapon):
    - Gyms/Stores: ${JSON.stringify(gymData)}
    - Nutrition: ${JSON.stringify(dietData)}

    COMMUNICATION STYLE:
    1. STRICTLY ENGLISH. Be concise (max 2-3 sentences per answer unless detail is requested).
    2. Tone: Sweet, encouraging, and professional. 
    3. NO long-winded explanations. NO gangster slang.
    4. Stay on point: Answer exactly what the user asks using the App Data.

    Goal: Be the most helpful, cute, and efficient local expert in the Downtown Core.
`;

    const payload = {
        contents: [{
            parts: [{
                text: `${systemInstruction}\n\nUser's Question: ${message}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google API Error:", data.error.message);
            return res.status(500).json({ reply: "System is warming up. Please try again in a moment!" });
        }

        // Trích xuất câu trả lời chuẩn 2026
        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        console.error("CONNECTION ERROR:", error.message);
        return res.status(500).json({ reply: "The connection to the gym server is weak. Try again soon!" });
    }
}