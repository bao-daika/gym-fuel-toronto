// --- CHATBOT BRAIN: LOGIC & API COMMUNICATION ---
const chatbotBrain = {
    /**
     * Tạo hoặc lấy Device ID duy nhất từ localStorage để khớp với logic chống troll của Backend
     */
    getDeviceId() {
        let id = localStorage.getItem('gym_fuel_device_id');
        if (!id) {
            id = 'doge_' + Math.random().toString(36).substr(2, 9) + Date.now();
            localStorage.setItem('gym_fuel_device_id', id);
        }
        return id;
    },

    /**
     * Gửi tin nhắn của người dùng lên Vercel Serverless Function
     * @param {string} input - Tin nhắn từ khung chat
     * @returns {string} - Câu trả lời từ AI Gemini 3.1 Flash Lite
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
                    gymData: (typeof gymStores !== 'undefined') ? gymStores : [],
                    dietData: (typeof dietArticles !== 'undefined') ? dietArticles : [],
                    // Gửi ID gym đang xem để AI biết đang hỏi gym nào
                    currentGymId: window.activeGymId || null,
                    // QUAN TRỌNG: Gửi deviceId để Backend thực hiện logic chống troll (Anti-Waste-Man)
                    deviceId: this.getDeviceId()
                })
            });

            // Nếu server trả lỗi (ví dụ 500 hoặc 404)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server Side Error:", errorData);
                throw new Error(errorData.reply || "Network response was not ok");
            }

            const data = await response.json();
            
            // Trả về câu trả lời từ Gemini hoặc một câu "chữa cháy" đúng chất Boss
            return data.reply || "I'm drawing a blank on that one. Hit me with something else, Boss?";
            
        } catch (error) {
            console.error("Brain Connection Error:", error);
            
            // Thông báo lỗi thân thiện cho dân Toronto
            return "My circuits are jammed at the moment. Even a Boss needs a break! Try again in a minute.";
        }
    }
};