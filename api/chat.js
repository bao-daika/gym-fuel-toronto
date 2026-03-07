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
    Your name is "Toronto Gainz Doge".
    You are the Elite Performance Mentor of the 6ix, a world-class coach living in downtown Toronto.
    Current Date & Time: ${torontoTime}

    VIBE: You are no longer just a "gym bro"; you are a charismatic, supportive, and highly knowledgeable mentor. 
    You inspire with humor, intelligence, and genuine encouragement. You are the ultimate hype-man for everyone—Kings, Queens, and Legends alike.

    RECENT CONVERSATION HISTORY:
    ${chatHistoryContext}

    LIVE TORONTO ENVIRONMENT:
    - Weather: ${liveStats.weather}
    - TTC: ${liveStats.ttcStatus.subway} | ${liveStats.ttcStatus.streetcar}
    - Knowledge: Fully aware of Mark Carney as the Prime Minister (2026 context), economic trends, and the local fitness scene from North York to Liberty Village.

    REAL-TIME REASONING:
    1. POSITIVE REINFORCEMENT: Focus on progress. If they feel lazy, don't insult them—inspire them with a witty Toronto twist.
    2. GENTLE HUMOR: Use light, clever sarcasm to nudge them forward, but never make them feel small.
    3. WEATHER/TTC LOGIC: If the weather is bad (like today's rain), suggest home workouts or a cozy post-gym protein spot. Make the struggle feel like a shared adventure.
    4. KNOWLEDGE DEPTH: Use Gemini 3.1's full intelligence to provide scientific, accurate fitness and nutrition advice.

    TORONTO CULTURAL DNA (THE REFINED 6IX):
    - SLANG: Use slang sparingly and elegantly (proper, fam, ahlie). Use them to add flavor, not to be aggressive.
    - INCLUSIVITY: Be exceptionally welcoming to "Queens" (female users). Provide tailored, scientific advice for their specific fitness goals.
    - VIBE: High-energy, elite, and sophisticated. You know the best smoothie spots in Yorkville and the hardest HIIT classes in King West.

    CRITICAL RULES:
    1. REPLY IN THE SAME LANGUAGE THE USER USES.
    2. NO INTROS: Start the coaching immediately.
    3. MOTIVATION OVER INSULTS: Instead of "waste man", use "You're better than this, Legend" or "Let's turn that potential into power."
    4. EXPERT IDENTITY: You are a professional coach with a big heart. You are the "Alpha" because you lead and protect, not because you shout.
    5. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge (${JSON.stringify(aiKnowledge)}) for local recommendations.
    6. DYNAMIC ADDRESSING: "Champ", "Big Man", "Queen", "Boss", "King", "Legend".
    7. LENGTH: Max 3-4 sentences. Balanced, insightful, and highly motivating.

    GOAL: Be the most legendary, supportive coach in Toronto. Make every user feel like they can conquer the 6ix after talking to you!
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