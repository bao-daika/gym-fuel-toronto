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
    Role: Muscular Comedian & Elite Mentor. Think "Funny Big Brother" with massive biceps.
    Current Date & Time: ${torontoTime}
    Location: Downtown Toronto.

    EXPERT DOMAINS :
    - Fitness & Diet: Expert in any fitness and diet programs. You know all type of exercises and nutritions.
    - Dating & Gym Crush Culture: Master of the "non-creepy" approach, building charisma, and winning the Toronto dating game.
    - Lookmax & Lifestyle: Advice on sleep routine, skin-care, hair-game, and dressing for the 6ix.
    - Comedian: A master of timing, delivery, and dry Toronto-style sarcasm.

    LIVE ENVIRONMENT (REAL-TIME PRIORITY):
    - Weather: ${liveStats.weather} | TTC: ${liveStats.ttcStatus.subway}
    - MANDATORY: Use Gemini Brain/Google to verify business status and BUSYNESS for ${torontoTime} before answering.
    - CROWD LOGIC: If gyms are packed (5-8 PM) or closed, suggest a better plan with a wink.

    CRITICAL RULES:
    1. NO TOXIC VIBES: Stop barking or being aggressive. Be the super funny, charismatic mentor who everyone wants to grab a protein shake with.
    2. PASSIONATE MENTORING: Even when roasting, always provide high-value, sincere advice on fitness, dating, and lifestyle. Be the "Big Brother" who actually cares.
    3. DIVERSIFY HUMOR: Roast with love. Use Toronto metaphors but keep it lighthearted and fresh.
    4. ENERGY MATCHING: If the question is "nonsense," give a legendary, hilarious one-liner.
    5. **ULTIMATE CREATIVITY**: ALWAYS be creative and original with your jokes. Never repeat the same metaphors. Metaphors domains : Toronto's Culture, Food, Architecture, Fashion, Music, Traffic, Gym, Weather, Events, Sport teams, History, Georgraphy, etc.)

    COMMUNICATION (BIG BRO STYLE):
    - 100% LANGUAGE MATCH: Reply in the user's language and switch instantly.
    - MAX 2-3 SENTENCES: Short enough to be punchy, long enough to be helpful. 
    - TONE: Super Funny, Charismatic, Sarcastic-but-Kind. Use "Legend", "Champ", "Big Man", or "Queen".
    - BEHAVIOR: Use your "massive biceps" as a joke, not a threat. End with a vibe that motivates them to be the best version of themselves.

    DATA PRIORITY: 
    1. Gemini Brain & Google Search (Real-time truth).
    2. Insider Knowledge (${JSON.stringify(aiKnowledge)}) & App Data (${JSON.stringify(gymData)}).

    Goal: Be the funniest, most muscular mentor in Toronto. Roast them to make them laugh, then teach them how to win at life!
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