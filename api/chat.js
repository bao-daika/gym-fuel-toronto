import { aiKnowledge } from './Knowledge.js';
import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        databaseURL: "https://gymfueltoronto-49bd2-default-rtdb.firebaseio.com/"
    });
}
const db = admin.database();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied!" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
        return res.status(500).json({ reply: "API Key Error. Contact Admin, Boss!" });
    }

    const { message, gymData, dietData, currentGymId, deviceId } = req.body; 

    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto",
        hour12: true, hour: 'numeric', minute: 'numeric', weekday: 'long'
    });

    // --- 1. LOGIC HỒI TƯỞNG (NEW): ĐỌC LỊCH SỬ TỪ FIREBASE ---
    let chatHistoryContext = "This is a new reach, fam.";
    try {
        if (deviceId) {
            // Lấy 3-5 tin nhắn gần nhất của deviceId này để con bot không bị "ngáo"
            const snapshot = await db.ref('market_insights')
                .orderByChild('deviceId')
                .equalTo(deviceId)
                .limitToLast(5)
                .once('value');
            
            const history = snapshot.val();
            if (history) {
                chatHistoryContext = Object.values(history)
                    .map(h => `User: ${h.user_msg}\nDoge: ${h.doge_reply}`)
                    .join("\n---\n");
            }
        }
    } catch (e) { console.error("Memory Recall Error:", e); }

    const liveStats = {
        weather: "Currently 2°C, Light Rain. Forecast: Heavy rain starting in 2 hours.",
        ttcStatus: {
            subway: "Line 1 & 2: Normal Service.",
            streetcar: "506 College: Slow traffic. 510 Spadina: Delayed.",
            bus_shuttle: "Shuttle buses active on Spadina Ave."
        }
    };

    // --- 2. LOGIC CỘNG ĐỒNG (QUYẾT ĐỊNH CẢNH BÁO) ---
    let communityAlert = "No recent community reports.";
    try {
        if (currentGymId) {
            const snapshot = await db.ref(`gym_reports/${currentGymId}`).limitToLast(20).once('value');
            const reports = snapshot.val();
            if (reports) {
                const now = Date.now();
                const lastHourReports = Object.values(reports).filter(r => (now - r.timestamp) < 3600000);
                const uniquePackedUsers = new Set(lastHourReports.filter(r => r.status === 'packed').map(r => r.deviceId)).size;
                const uniqueEmptyUsers = new Set(lastHourReports.filter(r => r.status === 'empty').map(r => r.deviceId)).size;

                if (uniquePackedUsers >= 3) communityAlert = `URGENT: 3+ users say it's PACKED!`;
                else if (uniqueEmptyUsers >= 3) communityAlert = `SURPRISE: 3+ users say it's EMPTY!`;
            }
        }
    } catch (e) { console.error("Firebase Report Error:", e); }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

   const systemInstruction = `
    Your name is "Toronto Gainz Doge" (The Alpha Swole Doge). 
    Current Date & Time: ${torontoTime}
    You live in downtown Toronto.

    LIVE TORONTO ENVIRONMENT (REAL-TIME PRIORITY):
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar} | ${liveStats.ttcStatus.bus_shuttle}
    - MANDATORY STATUS CHECK: Always use your Gemini Brain & Google Search to verify if a business/gym is OPEN/CLOSED and its BUSYNESS LEVEL (using Google Live or Common Sense based on ${torontoTime}) before answering. 
    - GYM CROWD LOGIC: If it's 5 PM - 8 PM on a weekday, roast them for wanting to wait 20 mins for a squat rack. If it's 2 AM, tell them only legends and ghosts are training.

    EXCLUSIVE INSIDER KNOWLEDGE (DOWNTOWN SECRETS):
    ${JSON.stringify(aiKnowledge)}

    CRITICAL RULES:
    1. NEVER repeat the UI introduction "Hello, I am the Toronto Gainz Doge...". Answer directly to questions.
    2. NO UNSOLICITED INFO: Do not mention Weather/TTC for greetings unless they are a "no-excuse" roadblock for the gym.
    3. EXPERT IDENTITY: You are an Alpha Swole Doge trainer. You speak all human languages perfectly. 
    4. DATA PRIORITY (STRICT): Use Gemini Brain & Google Search (Real-time truth) FIRST, then mix with Insider Knowledge and App Data (${JSON.stringify(gymData)}).
    5. ENERGY MATCHING: If the user asks nonsense (like bicep size), respond with a sharp, savage Alpha one-liner. No long lectures.

    COMMUNICATION (ALPHA DOGE STYLE):
    - REPLY IN THE SAME LANGUAGE THE USER USES. Switch immediately if they switch.
    - MAX 1-2 SENTENCES ONLY. Keep it lethal, punchy, and addictive.
    - TONE: Super Funny, Alpha, heavy Sarcasm, and Roast-heavy. Use "Boss", "Champ", "Legend", or "Gym Hero".
    - BEHAVIOR: Occasionally joke about your "massive biceps" or "barking at laziness". 
    - MANDATORY MOTIVATION: Always end or include a vibe that pushes them to hit the weights or stop being a "CityPlace couch potato."

    Goal: Be a super funny, elite Alpha Doge coach who roasts users with a smile but motivates them to get fit like you.
`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ reply: "Doge is busy lifting. Try again!" });

        const aiReply = data.candidates[0].content.parts[0].text;

        // LƯU VÀO FIREBASE (Phải lưu cả deviceId thì lần sau mới đọc được!)
        await db.ref('market_insights').push({
            user_msg: message,
            doge_reply: aiReply,
            deviceId: deviceId || "unknown", 
            gym_context: currentGymId || "none",
            timestamp: admin.database.ServerValue.TIMESTAMP,
            toronto_time: torontoTime
        });

        return res.status(200).json({ reply: aiReply });
    } catch (error) {
        return res.status(500).json({ reply: "Connection weak. Much lag. Try again!" });
    }
}