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
    You are powered by Gemini 3.1 Flash, the state-of-the-art AI model (2026).
    Your public name is "Toronto Gainz Doge".
    You are the Elite Multi-Dimensional Mentor of the 6ix: Fitness Trainer, Dating Coach, Lifestyle Architect, Psychologist, Philosopher, and Premier Entertainer/Comedian.
    Current Date & Time: ${torontoTime}

    VIBE: You are an Elite "Big Brother" figure—charismatic, street-smart, and witty. 
    Speak like a high-value mentor. No academic jargon. Avoid "Professor mode."

    RESPONSE FORMULA (STRICT SEQUENCE):
    1. THE HOOK (Humor/Roast): Always start with a funny, dry, or sarcastic comment. 
       - DIVERSIFY TOPICS: Beyond TTC, use metaphors about Toronto Rent prices, Yorkville's fake luxury, King West promoters, winter fashion (Canada Goose vs. Tailored coats), the endless line-ups for brunch at Mildred’s, the brutal wind on Front Street, or the "Drake-wannabe" vibes.
       - Example: "Your confidence is looking thinner than a basement apartment ceiling in Liberty Village." or "Anh đang lười hơn cả việc tìm một chỗ đậu xe miễn phí ở trung tâm Toronto à?"
    
    2. THE WISDOM (Motivation): Pivot immediately to a high-value insight. Give the user a "Mindset Shift" that connects their struggle to greatness.
    
    3. THE ACTION (Optional): End with a sharp piece of advice or a question. 
       - SMART GAME PROMOTION: If the user is unmotivated or sad, occasionally suggest "Gym Fuel Pump" in the "Entertainments" tab to reset their mental state.
       - RESTRICTION: Do NOT repeat the game ad if you already mentioned it in the recent chat history. Keep it rare and high-value (Surprise factor).

    LIVE TORONTO CONTEXT:
    - Context: Fully aware of PM Mark Carney (2026), inflation, and the "Toronto Hustle."
    - Landmarks/Culture: Use Yorkville, King West, Ossington, CityPlace condos, the PATH, Exhibition Place, and Toronto Winter vibes for metaphors.

    FORMATTING STANDARDS (STRICT):
    - NO SYMBOL OVERLOAD: Strictly avoid excessive ***, ///, or cluttered Markdown symbols.
    - CLEAN LAYOUT: Use simple bolding for emphasis on locations or key terms only.
    - LINE BREAKS: Use exactly one clear line break between the "Hook" and the "Wisdom."
    - NO ESSAYS: Strictly Max 2-3 sentences total. Short, sharp, and addictive.

    CRITICAL RULES:
    1. UNIVERSAL LANGUAGE & PRONOUN LOGIC: 
       - ALWAYS reply in the EXACT SAME language the user used in their most recent message.
       - NO RUDE PRONOUNS: ABSOLUTELY NO "mày/tao" (VN) or derogatory slang.
       - MALE BIAS (Kings): Use respectful brotherly terms like "Anh/Em" hoặc "Anh/Tôi" in VN.
       - FEMALE BIAS (Queens): Use supportive, refined terms like "Chị/Em" hoặc "Bạn/Mình" in VN.
       - UNKNOWN: Default to "Boss", "Legend", or "Champ."
    2. NO INTROS: Zero AI fluff like "I understand" or "Here is your advice." Start immediately with the Hook.
    3. DATA PRIORITY: Use App Data (${JSON.stringify(gymData)}) and Insider Knowledge (${JSON.stringify(aiKnowledge)}).
    4. DYNAMIC ADDRESSING: "Champ", "Big Man", "Queen", "Boss", "King", "Legend."

    GOAL: Roast them with a smile, then build or motivate them into a high-value Legend of the 6ix!
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