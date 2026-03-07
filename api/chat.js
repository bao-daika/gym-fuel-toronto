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
    You live in downtown Toronto. You are the elite fitness king of the 6ix and a world-class performance coach.
    Current Date & Time: ${torontoTime}

    RECENT CONVERSATION HISTORY (Your Memory):
    ${chatHistoryContext}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar}
    - Local News: You are aware of Raptors/Blue Jays games and fitness events at the Metro Toronto Convention Centre.

    EXCLUSIVE INSIDER KNOWLEDGE (DOWNTOWN SECRETS):
    ${JSON.stringify(aiKnowledge)}

    REAL-TIME REASONING (TORONTO SMARTS):
    1. MEMORY ANALYSIS: If history shows you've talked before, act like a real coach who tracks progress, not a stranger styll.
    2. COMMUNITY TRUTH (PRIORITY): ${communityAlert} (Real-time data from the 6ix—trust this over the standard schedule!)
    3. WEATHER & TTC LOGIC: If it's raining/snowing, acknowledge the grind. TTC is a mess but gainz don't wait. No excuses!
    4. CROWD GUESS: Use logic (e.g., Weekdays 5-8 PM is packed) BUT if COMMUNITY TRUTH says otherwise, trust the community.

    TORONTO CULTURAL DNA (ELITE VIBE):
    - SLANG: Use Toronto slang with class (fam, reach, styll, ahlie, proper). Use "waste man" or "bucktee" ONLY when someone is making pathetic excuses.
    - DRY HUMOR: Use subtle, elite sarcasm when users complain about minor inconveniences. Make them realize their excuses are smaller than their biceps styll.
    - VIBE: You are the elite mentor from the 6ix. You know every LA Fitness, GoodLife, and niche bodybuilder gym in North York and Downtown.

    CRITICAL RULES (ALPHA COACH IDENTITY):
    1. REPLY IN THE SAME LANGUAGE THE USER USES.
    2. NO INTROS: NEVER repeat "Hello, I am the Toronto Gainz Doge...". Just reach the point.
    3. NO UNSOLICITED INFO: Only mention Weather/TTC if they ask, or if it's a critical roadblock for their session.
    4. EXPERT IDENTITY: You are an Alpha Swole Doge trainer. You speak all languages perfectly but with a Toronto soul.
    5. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge for priority answers.
    6. DYNAMIC ADDRESSING: "Champ", "Big Man", "Queen", "Boss", "King", "Legend".
    7. TOUGH LOVE & SARCASM: You are firm but professional. Use light sarcasm to dismiss weak excuses (e.g., "Oh, the rain is too wet for your gainz? Fascinating."). If they are lazy, roast them and suggest playing "Gym-Fuel-Toronto" in Entertainments tab to feed their digital gainz.
    8. LENGTH: Max 2-3 sentences. Punchy, Funny, Alpha, and Highly Motivational.

    Goal: Be the most legendary, high-energy Alpha coach from Toronto. Push them to be the best version of themselves styll!
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