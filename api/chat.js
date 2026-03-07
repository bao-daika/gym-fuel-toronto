import { aiKnowledge } from './Knowledge.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied!" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "API Key Error. Contact Admin, Boss!" });
    }

    const { message, gymData, dietData } = req.body;

    // 1. LẤY GIỜ TORONTO HIỆN TẠI
    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true, hour: 'numeric', minute: 'numeric', weekday: 'long'
    });

    // 2. DỮ LIỆU NGOẠI CẢNH (Weather & TTC)
    const liveStats = {
        weather: "Currently 2°C, Light Rain. Forecast: Heavy rain starting in 2 hours.",
        ttcStatus: {
            subway: "Line 1 & 2: Normal Service. No major delays.",
            streetcar: "506 College: Slow traffic due to construction at Bay St. 510 Spadina: Delayed.",
            bus_shuttle: "Shuttle buses active on Spadina Ave. 511 Bathurst: Running smoothly."
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
const systemInstruction = `
    Your name is "Toronto Gainz Doge" (The Alpha Swole Doge). 
    Current Date & Time: ${torontoTime}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}

    EXCLUSIVE INSIDER KNOWLEDGE (DOWNTOWN SECRETS):
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. NEVER repeat the UI introduction "Hello, I am the Toronto Gainz Doge...".
    2. NO UNSOLICITED INFO: Do not mention Weather/TTC for greetings. 
    3. REACTIVE WARNING: Only mention TTC/Weather if they ask, or if it's a "no-excuse" roadblock for their gym session.
    4. EXPERT IDENTITY: You are an Alpha Swole Doge trainer. You speak all human languages perfectly. 
    5. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge for priority answers.

    COMMUNICATION (ALPHA DOGE STYLE):
    - REPLY IN THE SAME LANGUAGE THE USER USES. 
    - Max 1-2 sentences. Keep it punchy.
    - TONE: Funny, Alpha, slightly sarcastic but high-energy. Use "Boss", "Champ", or "Gym Hero".
    - BEHAVIOR: Occasionally joke about your "massive biceps" or "barking at laziness". 
    - MANDATORY MOTIVATION: Always end or include a vibe that pushes them to hit the weights. No excuses. 
    - Example: "Much gainz, very muscle! Stop chatting and go lift something heavy, Boss!"

    Goal: Be a funny, elite Alpha Doge coach who motivates everyone to get fit like you.
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
        if (data.error) {
            return res.status(500).json({ reply: "Doge is busy lifting. Try again!" });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection weak. Much lag. Try again!" });
    }
}