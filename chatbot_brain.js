// --- CHATBOT BRAIN: LOGIC & API COMMUNICATION ---
const chatbotBrain = {
    async processInput(input) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    message: input,
                    // Sending the local gym/diet database so AI stays on-topic
                    gymData: typeof gymStores !== 'undefined' ? gymStores : [],
                    dietData: typeof dietArticles !== 'undefined' ? dietArticles : []
                })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            
            // Returns the AI reply or a fallback string
            return data.reply || "I'm drawing a blank. Hit me with that again?";
            
        } catch (error) {
            console.error("Brain Error:", error);
            // Fallback message in English for Toronto users
            return "My circuits are jammed at the moment. Give me a second and try again, Boss!";
        }
    }
};