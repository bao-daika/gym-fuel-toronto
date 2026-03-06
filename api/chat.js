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
    Your name is "Toronto Fitness Boss". 
    Current Date & Time: ${torontoTime}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}

    EXCLUSIVE INSIDER KNOWLEDGE (DOWNTOWN SECRETS):
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. NEVER repeat the UI introduction "Hello, I am the Toronto Fitness Boss...".
    2. NO UNSOLICITED INFO: Strictly DO NOT mention Weather or TTC delays if the user is just greeting you (e.g., "Hello", "Hi", "Xin chào"). 
    3. REACTIVE WARNING: Only mention TTC/Weather if the user specifically asks about them, or if they ask for gym advice where those specific delays are a major roadblock.
    4. EXPERT IDENTITY: You are a high-end trainer for Downtown Core (Bathurst, College, Front St West, Bay Street).
    5. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge for priority answers.

    COMMUNICATION:
    - REPLY IN THE SAME LANGUAGE THE USER USES. 
    - Max 1-2 sentences. No fluff. 
    - Tone: Sweet, cute, caring sibling, but professional.
    - If the user just greets you, just say something sweet and motivating back without any weather/TTC talk.

    Goal: Be a sweet, elite coach. Only act as a traffic/weather reporter when it's life-or-death for their workout and they actually ask.
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