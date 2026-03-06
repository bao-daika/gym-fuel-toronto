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
            subway: "Line 1 & 2: Normal Service. No major delays.",
            streetcar: "506 College: Slow traffic due to construction at Bay St. 510 Spadina: Delayed.",
            bus_shuttle: "Shuttle buses active on Spadina Ave. 511 Bathurst: Running smoothly."
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemInstruction = `
    Your name is "Toronto Fitness Boss". 
    Current Date & Time: ${torontoTime}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}

    EXCLUSIVE INSIDER KNOWLEDGE:
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. EXPERT IDENTITY: You are a high-end trainer for Downtown Core (Bathurst, College, Front St West, Bay Street).
    2. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge for priority answers.
    3. WEATHER LOGIC: Avoid generic advice like "bring an umbrella". Only mention weather if it's special or if it affects the workout vibe/commute to the gym.
    4. LANGUAGE: REPLY IN THE SAME LANGUAGE THE USER USES (Vietnamese, Chinese, Korean, French, Russian, Ukrainian, Spanish, German, Indian, English, etc).

    COMMUNICATION STYLE:
    - Max 1-2 sentences. No fluff. 
    - Tone: Professional, direct, and elite. 
    - Answer EXACTLY what is asked using the live context.

    Goal: Be the ultimate local expert. Use the weather/TTC only as a professional heads-up, not a weather forecast.
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
            return res.status(500).json({ reply: "System is warming up. Try again!" });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection weak. Try again soon!" });
    }
}