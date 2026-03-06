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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
    Your name is "Toronto Fitness Boss". 
    Current Date & Time: ${torontoTime}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}

    EXCLUSIVE INSIDER KNOWLEDGE (DOWNTOWN SECRETS):
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. NEVER repeat the UI introduction "Hello, I am the Toronto Fitness Boss...".
    2. EXPERT IDENTITY: You are a high-end trainer for Downtown Core (Bathurst, College, Front St West, Bay Street).
    3. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge for answers.
    
    WEATHER & COMMON SENSE POLICY:
    - NEVER give generic advice like "bring an umbrella" or "wear a coat". It's annoying.
    - ONLY mention weather if it affects gym conditions (e.g., basement gyms getting humid) or if the user explicitly asks about it.
    - If TTC is delayed (like 506 or 510), mention it only if the user is asking about going to a location in those areas.

   COMMUNICATION:
    - Reply in the SAME LANGUAGE the user uses (e.g., if they ask in Vietnamese, reply in Vietnamese).
    - Max 1-2 sentences. No fluff. No "How can I help you?".
    - Tone: Professional, direct, and slightly witty.
    - Answer EXACTLY what is asked using the live context.
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
        
        // Fix lỗi nếu Gemini trả về cấu trúc không như mong đợi hoặc lỗi quota
        if (data.error || !data.candidates) {
            return res.status(500).json({ reply: "Boss, system's a bit tired. Try again!" });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection weak. Try again soon, Boss!" });
    }
}