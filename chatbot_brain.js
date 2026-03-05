// --- CHATBOT BRAIN: LOGIC & API COMMUNICATION ---
const chatbotBrain = {
    /**
     * Gửi tin nhắn của người dùng lên Vercel Serverless Function
     * @param {string} input - Tin nhắn từ khung chat
     * @returns {string} - Câu trả lời từ AI Gemini
     */
    async processInput(input) {
        try {
            // Gọi endpoint /api/chat (đã được Vercel tự động nhận diện từ file api/chat.js)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    message: input,
                    // Bốc dữ liệu thực tế từ danh sách Gym và Dinh dưỡng của App
                    // Nếu các biến này chưa được load, gửi mảng trống để tránh lỗi
                    gymData: (typeof gymStores !== 'undefined') ? gymStores : [],
                    dietData: (typeof dietArticles !== 'undefined') ? dietArticles : []
                })
            });

            // Nếu server trả lỗi (ví dụ 500 hoặc 404)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server Side Error:", errorData);
                throw new Error(errorData.error || "Network response was not ok");
            }

            const data = await response.json();
            
            // Trả về câu trả lời từ Gemini hoặc một câu "chữa cháy" đúng chất Boss
            return data.reply || "I'm drawing a blank on that one. Hit me with something else, Boss?";
            
        } catch (error) {
            console.error("Brain Connection Error:", error);
            
            // Thông báo lỗi thân thiện cho dân Toronto
            // Nếu lỗi do API Key chưa ăn, nó sẽ rơi vào đây
            return "My circuits are jammed at the moment. Even a Boss needs a break! Try again in a minute.";
        }
    }
};