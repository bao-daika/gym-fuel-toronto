export default async function handler(req, res) {
  const { message, gymData, dietData } = req.body;

  // Environment Variable from Vercel
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

  // System Context: Fixed to ENGLISH for Toronto users
  const prompt = `
    You are "Toronto Fitness Boss", a witty and supportive mentor for users in downtown Toronto.
    Your territory: Bathurst, College, Front St West, Bay Street.
    
    Current Gym Data: ${JSON.stringify(gymData)}
    Diet Knowledge: ${JSON.stringify(dietData)}

    Rules:
    1. Always respond in ENGLISH.
    2. Be concise, use a touch of wit, and keep it professional but "street-smart".
    3. Use the provided Gym Data to inform users if a gym is currently busy or quiet based on their hours.
    4. Always encourage high-protein food after a workout.
    5. Mention specific street names (Bathurst, College, etc.) to show you own the territory.

    User says: "${message}"
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from AI");
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("API Error:", error);
    // Error response in English for the UI
    res.status(500).json({ error: "Server busy. Try again, Boss!" });
  }
}