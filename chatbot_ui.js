// --- CHATBOT UI: DISPLAY LOGIC (Bao Luoi Optimized - Big & Sweet & Responsive) ---

window.toggleChat = () => {
    const panel = document.getElementById('chatbot-panel');
    if (panel) {
        const isMobile = window.innerWidth < 768; // Kiểm tra nếu là điện thoại
        
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'flex';
            
            if (isMobile) {
                // Trên Mobile: Chiếm toàn bộ để không bị vỡ layout
                panel.style.width = "100%";
                panel.style.height = "100%";
                panel.style.bottom = "0";
                panel.style.right = "0";
                panel.style.borderRadius = "0"; 
            } else {
                // Trên Desktop: Giữ nguyên độ to 1.5x của anh Bảo
                panel.style.width = "525px"; 
                panel.style.height = "750px";
                panel.style.bottom = "100px";
                panel.style.right = "25px";
                panel.style.borderRadius = "1.5rem";
            }
        } else {
            panel.style.display = 'none';
        }
    }
};

window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    // 1. Display User Message
    addChatMessageUI(text, true);
    input.value = "";

    // 2. Display "Thinking" state
    const loadingId = "loading-" + Date.now();
    addChatMessageUI("Thinking...", false, loadingId);

    // 3. Call Brain Logic
    try {
        const reply = await chatbotBrain.processInput(text);
        
        // 4. Update with the AI response
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerText = reply;
        }

    } catch (error) {
        console.error("Chatbot Error:", error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerText = "The connection is a bit weak, sibling. Try again in a sec! 🧸";
        }
    }
};

function addChatMessageUI(text, isUser, id = null) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msg = document.createElement('div');
    if (id) msg.id = id; 
    
    // Giữ nguyên style "Big & Sweet" anh thích
    msg.className = isUser 
        ? "bg-blue-600 ml-auto rounded-3xl p-4 text-white max-w-[85%] shadow-xl mb-3 text-lg" 
        : "bg-white/10 border border-white/10 rounded-3xl p-4 text-blue-100 max-w-[85%] mb-3 text-lg shadow-inner";
    
    msg.innerText = text;
    container.appendChild(msg);
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Global Listener for Enter Key & Setup Placeholder
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if (input) {
        input.placeholder = "Ask me anything...";
        // Scale font size cho đồng bộ với chatbox to
        input.style.fontSize = "1.1rem"; 
        input.style.padding = "15px";

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendMessage();
        });
    }
});