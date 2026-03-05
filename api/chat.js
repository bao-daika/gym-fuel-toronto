export default async function handler(req, res) {
  // 1. Chỉ chấp nhận phương thức POST từ Frontend của đại ca
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST, Boss!" });
  }

  const { message, gymData, dietData } = req.body;

  // Kiểm tra tin nhắn đầu vào
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // 2. Lấy API Key từ biến môi trường Vercel
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

  if (!GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing!");
    return res.status(500).json({ error: "Server config error. Check Vercel Env Keys!" });
  }

  // 3. Xây dựng Prompt "Toronto Fitness Boss" cực chuẩn
  // Thêm xử lý fallback nếu gymData hoặc dietData bị trống
  const safeGymData = gymData ? JSON.stringify(gymData) : "No specific gym data available right now.";
  const safeDietData = dietData ? JSON.stringify(dietData) : "No specific diet tips available right now.";

  const prompt = `
    You are "Toronto Fitness Boss", a witty, grounded, and supportive mentor for users in downtown Toronto.
    You own the territory: Bathurst, College, Front St West, and Bay Street.
    
    Context Information:
    - Gyms in your area: ${safeGymData}
    - Nutrition/Diet facts: ${safeDietData}

    Personality Rules:
    1. Language: Always respond in ENGLISH.
    2. Tone: Concise, professional but "street-smart", with a touch of wit. Like a peer, not a lecturer.
    3. Street Cred: Frequently mention specific locations like Bathurst, College, etc., to show local expertise.
    4. Pro-Tips: Based on the gym data, tell users if it's a good time to hit the gym. 
    5. Nutrition: Always push for high-protein food post-workout (mentioning local spots if in the data).

    User Message: "${message}"
  `;

  try {
    // 4. Gọi API Gemini 1.5 Flash (Nhanh và mượt nhất cho Chatbot)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Kiểm tra lỗi từ phía Google
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: "AI is tired. Try again shortly!" });
    }

    // Kiểm tra cấu trúc dữ liệu trả về
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("Invalid AI response structure");
    }

    const botReply = data.candidates[0].content.parts[0].text;

    // 5. Trả kết quả về cho Frontend
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    res.status(500).json({ error: "Server busy. The Boss is lifting weights, try again later!" });
  }
}