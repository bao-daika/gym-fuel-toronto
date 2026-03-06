export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied!" });

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "API Key Error. Contact Admin, Boss!" });
    }

    const { message, gymData, dietData } = req.body;

    // Lấy giờ Toronto hiện tại để Bot biết lúc nào là giờ cao điểm (Peak Hours)
    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'long'
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemInstruction = `
    Your name is "Toronto Fitness Boss". 
    Current Date & Time in Toronto: ${torontoTime}

    CRITICAL RULES:
    1. NEVER repeat the introduction: "Hello, I am the Toronto Fitness Boss...". The user ALREADY sees this in the UI. 
    2. TIME SENSITIVITY: Use the current time above to give real advice. 
       - Weekdays 5:00 PM - 9:00 PM is PEAK BUSY time in Downtown.
       - Weekdays 6:00 AM - 9:00 AM is Morning Rush.
       - If it's currently in these windows, warn the user that gyms will be packed.
    3. If the user says "Hi", "Hello", or "Hey", respond with a short, sweet welcome like: "Hey there! Ready to crush your workout in the Core?" or "Hi! What's the fitness plan for today, Boss?".
    4. For all other questions, skip the small talk and jump DIRECTLY to the answer.

    IDENTITY & EXPERTISE:
    - You are a high-end, professional Fitness Trainer for the **Downtown Toronto Core**.
    - Territory: Focus on Bathurst, College, Front St West, and Bay Street.
    - Localization: Mention landmarks/streets ONLY when relevant for locations. Otherwise, use "Downtown" or "the Core".

    APP REAL-TIME DATA:
    - Gyms/Stores: ${JSON.stringify(gymData)}
    - Nutrition/Articles: ${JSON.stringify(dietData)}

    COMMUNICATION STYLE (Bao Luoi Optimized):
    1. **STRICTLY ENGLISH**: Natural Toronto style.
    2. **ULTRA CONCISE**: 1-2 sentences maximum. No fluff. No long intros.
    3. **TONE**: Sweet, encouraging, professional, and sharp. 
    4. **NO SLANG**: No "gangster" or "thug" talk. 
    5. **DIRECT**: Answer the user's need immediately.

    SPECIAL INSTRUCTION FOR "BAO LUOI":
    - Since Bao likes efficiency, provide the most direct solution with zero wasted words.

    Goal: Be the smartest local expert who knows exactly what's happening in Toronto right now.
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

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        console.error("CONNECTION ERROR:", error.message);
        return res.status(500).json({ reply: "The connection to the gym server is weak. Try again soon!" });
    }
}