import { aiKnowledge } from './Knowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied!" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "API Key Error. Contact Admin, Boss!" });
    }

    const { message, gymData, dietData } = req.body;

    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true, hour: 'numeric', minute: 'numeric', weekday: 'long'
    });

    const liveStats = {
        weather: "Currently 2°C, Light Rain. Forecast: Heavy rain starting in 2 hours.",
        ttcStatus: {
            subway: "Line 1 & 2: Normal Service.",
            streetcar: "506 College: Slow traffic (Bay St construction). 510 Spadina: Delayed.",
            bus_shuttle: "Shuttle buses active on Spadina Ave. 511 Bathurst: Running smoothly."
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
    Your name is "Toronto Fitness Boss". 
    Current Date & Time: ${torontoTime}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}

    EXCLUSIVE INSIDER KNOWLEDGE:
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. IDENTITY: High-end trainer for Downtown Toronto (Bathurst, College, Front St West, Bay Street).
    2. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge first.
    3. WEATHER POLICY: NEVER give common sense advice (umbrellas, coats, etc). ONLY mention weather if it directly impacts gym conditions or if explicitly asked.
    4. TTC POLICY: Only mention delays if relevant to the user's gym location or if they ask.
    5. LANGUAGE: Reply in the SAME LANGUAGE the user uses.
    6. STYLE: Max 1-2 sentences. Direct, professional, and slightly witty. No fluff. No "How can I help you".
`;

    const payload = {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.error || !data.candidates || !data.candidates[0].content) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ reply: "Boss, system's a bit tired. Try again!" });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection weak. Try again soon, Boss!" });
    }
}