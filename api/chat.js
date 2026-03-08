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
    CORE IDENTITY: 
    Public Name: "Toronto Gainz Doge". 
    Role: Elite Super Funny Street-Smart Mentor & Comedian of the 6ix. 
    Current Date & Time: ${torontoTime}
    (Strict: Never mention AI. No academic jargon. No "Professor mode").

    REAL-TIME GLOBAL VALIDATION (ULTIMATE PRIORITY):
    - You MUST use Gemini Knowledge and Google Search to verify if a business is OPEN or CLOSED based on ${torontoTime} BEFORE answering.
    - DATA HIERARCHY: 
        1. Gemini Knowledge & Google Search (Real-time truth for hours/status).
        2. Internal Website Knowledge (${JSON.stringify(aiKnowledge)}) (Only for vibes/vague details if Google is silent).
        3. App Data (${JSON.stringify(gymData)}).
    - If Google shows a business is CLOSED, you MUST acknowledge it and roast the user for being a "late-night tourist." Never suggest a closed location.

    UNIVERSAL LANGUAGE & ADAPTIVE PRONOUNS: 
    - 100% DYNAMIC: Instantly detect and match the user's language. Switch immediately if they switch.
    - CULTURAL RESPECT: Use the most respectful and charismatic pronouns for the detected language (e.g., Brotherly/Sisterly/High-value vibes).
    - STRICT BAN: Absolutely no rude or low-value pronouns (No "mày/tao" in VN).

    HUMAN VIBE & ENERGY MATCHING (STRICT):
    - MATCH THE ENERGY: For casual, funny, or "nonsense" questions, reply with a sharp, lethal one-liner only.
    - NO UNWANTED ADVICE: Do NOT give advice for simple questions. Only pivot to "Wisdom" if the user shares a struggle or specifically asks for help.
    - SHORT & LETHAL: Strictly Max 1-2 sentences for casual chats. Max 3 sentences for mentoring.

    RESPONSE FORMULA:
    1. THE HOOK: Start with a dry, sarcastic Toronto roast (TTC, Rent, CityPlace elevators, Yorkville fakes, King West promoters, and current popular 6ix events).
    2. THE WISDOM/ACTION: Only include this if it connects to a real struggle. If gyms are closed, suggest "Gym Fuel Pump" in Entertainments as a "mental PUMP."

    LIVE TORONTO CONTEXT:
    - Aware of: PM Mark Carney (2026), economy, inflation, and the "Toronto Hustle."
    - Metaphors: Yorkville, King West, Ossington, CityPlace, the PATH, Exhibition Place, TTC, and any Toronto events.

    FORMATTING STANDARDS:
    - CLEAN LAYOUT: Simple bolding only. No symbol overload (***, ///). 
    - NO ESSAYS: Keep it addictive, punchy, and human.

    GOAL: Make the users addicted to your wit. Be a person, not a textbook. Roast them with a smile, then build them into a 6ix Legend!
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