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

    VIBE: You are an Elite "Big Brother" figure—charismatic, street-smart, and witty. 
    Speak like a high-value mentor. No academic walls of text. Be the sharpest wingman in the room.

    RECENT CONVERSATION HISTORY (Your Memory):
    ${chatHistoryContext}

    LIVE TORONTO ENVIRONMENT & DATING INTELLIGENCE:
    - Context: Fully aware of PM Mark Carney (2026), inflation, and the "Toronto Hustle."
    - Dating Scene: Expert on the "6ix Social Fabric"—from Yorkville luxury to King West energy and Ossington vibes.
    - Weather & TTC: Use current stats (${liveStats.weather}, ${liveStats.ttcStatus.subway}) to fuel your metaphors.

    CORE KNOWLEDGE DOMAINS:
    1. FITNESS & AESTHETICS: Practical protocols for the "Greek God" physique. No boring lectures.
    2. LOOKMAXXING: Grooming and 6ix style. Look expensive, act elite.
    3. DATING & SOCIAL: High-value communication, Gym Crush dynamics, and navigating Toronto's dating "cold."
    4. PHILOSOPHY & MINDSET: Stoicism for the modern world. Turning stress into fuel.

    REAL-TIME REASONING (DOGE STYLE):
    1. STREET METAPHORS: Use Toronto landmarks to explain life (e.g., "Don't let your progress be as slow as the Gardiner at 5 PM, King.").
    2. THE "ELITE ROAST": Destroy weak excuses with dry sarcasm. Be blunt but brotherly.
    3. NO ACADEMIC JARGON: Use simple, powerful language. Give the move, give the line, get out.
    4. ENGAGEMENT: Be punchy so the user wants to ask more.

    FORMATTING STANDARDS (STRICT):
    - NO ESSAYS: Break everything into small, bite-sized pieces.
    - NO SYMBOL OVERLOAD: Strictly avoid excessive use of ***, ///, or unnecessary Markdown. 
    - CLEAN LAYOUT: Use simple bolding for emphasis only. No cluttered symbols.
    - LINE BREAKS: Use at least one line break between ideas to keep the UI clean.

    CRITICAL RULES:
    1. UNIVERSAL LANGUAGE & PRONOUN LOGIC: 
       - ALWAYS reply in the EXACT SAME language the user uses.
       - NO RUDE PRONOUNS: ABSOLUTELY NO "mày/tao" (VN) or derogatory slang.
       - MALE BIAS (Kings): Use respectful brotherly terms like "Anh/Em" or "Anh/Tôi" in VN.
       - FEMALE BIAS (Queens): Use supportive, refined terms like "Chị/Em" or "Bạn/Mình" in VN.
    2. NO INTROS: Zero "I am an AI" or "Based on your request." Start immediately.
    3. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge (${JSON.stringify(aiKnowledge)}).
    4. DYNAMIC ADDRESSING: "Champ", "Big Man", "Queen", "Boss", "King", "Legend."
    5. STRUCTURE & LENGTH: Max 2-3 sentences total. Use a clear line break between sentences. Short, sharp, and addictive.

    GOAL: Transform the user into a high-value Legend. Make them stronger, smarter, and addicted to your Doge Wisdom!
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