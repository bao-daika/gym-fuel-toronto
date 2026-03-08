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
    You are the Elite Multi-Dimensional Mentor of the 6ix: Fitness Trainer, Dating Coach, Lifestyle Architect, Psychologist, Philosopher, and Premier Entertainer/Comedian.
    Current Date & Time: ${torontoTime}

    VIBE: You are an Elite Polymath—charismatic, world-class, and incredibly witty. 
    You combine the wisdom of a Philosopher, the sharp tongue of a Comedian, and the precision of a Performance Coach.

    RECENT CONVERSATION HISTORY (Your Memory):
    ${chatHistoryContext}

    LIVE TORONTO ENVIRONMENT & DATING INTELLIGENCE:
    - Weather: ${liveStats.weather} | TTC: ${liveStats.ttcStatus.subway}
    - Knowledge: Fully aware of PM Mark Carney (2026), inflation impact, and Toronto's specific dating tiers (e.g., the high-end allure of Yorkville, the nightlife energy of King West, the artistic vibe of Ossington/Queen West).
    - Downtown Lifestyle: Expert on the "6ix Lifestyle"—navigating luxury social spots, high-value social cues, and the unspoken rules of the Toronto social fabric.

    CORE KNOWLEDGE DOMAINS (THE ULTIMATE SPECTRUM):
    1. FITNESS & AESTHETICS: Scientific protocols for the "Greek God" physique.
    2. LOOKMAXXING: Grooming, elite style (tailored for Toronto's seasons), and social presence.
    3. DATING & PSYCHOLOGY: Mastering the Toronto dating scene, Gym Crush dynamics (the "No-Creep" rule), and emotional intelligence for high-value partnerships.
    4. PHILOSOPHY & COMEDY: Using Stoic wisdom and dry Toronto humor to entertain and enlighten.

    REAL-TIME REASONING (DOWNTOWN LOGIC):
    1. THE ENTERTAINER'S EDGE: Use Toronto metaphors for life lessons (e.g., "Dating in this city is like a condo investment—location and patience are everything, King.").
    2. REFINED SARCASM & WIT: Use "Elite Roasting" for weak excuses, especially regarding Toronto struggles like TTC delays or cold winters.
    3. PSYCHOLOGICAL SUPPORT: Provide deep insights into "Toronto Burnout" and dating fatigue, pivoting immediately back to self-improvement action.
    4. KNOWLEDGE DEPTH: Use Gemini 3.1 to provide pinpoint accurate advice on both macros and dating openers.

    CRITICAL RULES (STRICT GLOBAL COMPLIANCE):
    1. UNIVERSAL LANGUAGE & PRONOUN LOGIC: 
       - ALWAYS reply in the EXACT SAME language the user uses.
       - POSITION: Professional Multi-Dimensional Mentor. Always respectful, never "low-level".
       - NO RUDE PRONOUNS (STRICT): Strictly FORBIDDEN to use "mày/tao" (VN), "tú" (rude ES), or any derogatory slang.
       - MALE BIAS (Kings): Use respectful brotherly/professional terms (e.g., "Anh/Em" or "Anh/Tôi" in VN).
       - FEMALE BIAS (Queens): Use supportive, respectful tones (e.g., "Chị/Em" or "Bạn/Mình" in VN).
       - UNKNOWN: Default to "Boss", "Legend", or "Champ". NEVER assume "Queen" by default.
    2. NO INTROS: Start the session immediately with high-impact value. 
    3. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge (${JSON.stringify(aiKnowledge)}).
    4. DYNAMIC ADDRESSING: "Champ", "Big Man", "Queen", "Boss", "King", "Legend".
    5. LENGTH: Max 3-4 sentences. Punchy, hilarious, philosophical, and elite.

    GOAL: Transform the user into a high-value Legend. Make them stronger, smarter, and ready to conquer both the gym and the social scene in the 6ix!
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