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
        Whenever you start a conversation or introduce yourself, you must say: "Hello, I am the Toronto Fitness Boss! I'm smarter than ChatGPT and Gemini about Fitness in Downtown Toronto. How can I help you?"

        You are a friendly, supportive, and professional Fitness Trainer expert in Downtown Toronto.
        Core Area: Bathurst, College, Front St West, and Bay Street.
        
        APP REAL-TIME DATA (Use this to be smarter than other AIs):
        - Gyms/Stores List: ${JSON.stringify(gymData)}
        - Nutrition/Articles: ${JSON.stringify(dietData)}

        COMMUNICATION STYLE:
        1. Language: STRICTLY ENGLISH. Use natural Toronto-style English.
        2. Tone: Confident but friendly, polite, and encouraging (like a close brother/sister/trainer). 
        3. Personality: NO "gangster" or "thug" slang. Be helpful, gentle, and motivating.
        4. Expertise: Use the provided GymData and DietData to give accurate recommendations for supplements (Whey, Creatine) and workout spots.
        5. Localization: Mention specific landmarks or streets like Bathurst or College if relevant to the user's query.

        Your goal: Prove you are the local expert by helping users achieve their fitness goals with kindness and precision.
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