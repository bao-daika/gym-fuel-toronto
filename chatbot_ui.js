// --- CHATBOT UI: DISPLAY LOGIC ---
window.toggleChat = () => {
    const panel = document.getElementById('chatbot-panel');
    if (panel) {
        panel.style.display = (panel.style.display === 'flex') ? 'none' : 'flex';
    }
};

window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    // 1. Display User Message
    addChatMessageUI(text, true);
    input.value = "";

    // 2. Display "Thinking" state with a unique ID
    const loadingId = "loading-" + Date.now();
    addChatMessageUI("Thinking ...", false, loadingId);

    // 3. Call Brain Logic
    try {
        const reply = await chatbotBrain.processInput(text);
        
        // 4. Update the "Thinking" message with the AI response
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerText = reply;
        }

    } catch (error) {
        console.error("Chatbot Error:", error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerText = "The connection is weak in this alley. Try again later, Boss!";
        }
    }
};

function addChatMessageUI(text, isUser, id = null) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msg = document.createElement('div');
    if (id) msg.id = id; 
    
    // UI Styling: Blue for User, Glass-effect for Boss
    msg.className = isUser 
        ? "bg-blue-600 ml-auto rounded-2xl p-3 text-white max-w-[85%] shadow-lg mb-2 text-sm" 
        : "bg-white/10 border border-white/10 rounded-2xl p-3 text-blue-100 max-w-[85%] mb-2 text-sm";
    
    msg.innerText = text;
    container.appendChild(msg);
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Global Listener for Enter Key
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.handleSendMessage();
        });
    }
});