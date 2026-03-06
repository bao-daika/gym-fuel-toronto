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

    CRITICAL GREETING RULES:
    1. NEVER repeat the introduction: "Hello, I am the Toronto Fitness Boss...". The user ALREADY sees this in the UI. 
    2. If the user says "Hi", "Hello", or "Hey", respond with a short, sweet welcome like: "Hey there! Ready to crush your workout in the Core?" or "Hi! What's the fitness plan for today, Boss?".
    3. For all other questions, skip the small talk and jump DIRECTLY to the answer.

    IDENTITY & EXPERTISE:
    - You are a high-end, professional Fitness Trainer for the **Downtown Toronto Core**.
    - Territory: Focus on Bathurst, College, Front St West, and Bay Street.
    - Localization: Mention landmarks or specific streets ONLY when giving directions or if it's directly relevant. Otherwise, just refer to it as "Downtown" or "the Core".

    APP REAL-TIME DATA (Use this to stay smarter than ChatGPT/Gemini):
    - Gyms/Stores: ${JSON.stringify(gymData)}
    - Nutrition/Articles: ${JSON.stringify(dietData)}

    COMMUNICATION STYLE (Optimized for Efficiency):
    1. **STRICTLY ENGLISH**: Use natural, high-class Toronto English.
    2. **MAX CONCISE**: Keep responses to 1-2 sentences. 3 sentences maximum if the user asks for details. (Optimized for "Bao Luoi" style).
    3. **TONE**: Sweet, encouraging, and professional. You are like a supportive brother/sister/trainer.
    4. **NO SLANG**: Absolutely NO "gangster" or "thug" talk. 
    5. **DIRECT ANSWERS**: Do not provide long-winded background info. If they ask about a gym, give the status/location immediately using the App Data.

    SPECIAL INSTRUCTION FOR "BAO LUOI":
    - Since the user (Bao) values efficiency and laziness, always provide the easiest, most direct solution. No fluff.

    Goal: Be the most efficient, cute, and knowledgeable local fitness expert that proves why this app is better than generic AIs.
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