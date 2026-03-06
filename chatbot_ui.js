// --- CHATBOT UI: DISPLAY LOGIC (Bao Luoi Optimized - Big & Sweet) ---
window.toggleChat = () => {
    const panel = document.getElementById('chatbot-panel');
    if (panel) {
        // Tăng kích thước Panel lên 1.5 lần (Giả sử gốc là 350px -> 525px)
        panel.style.width = "525px"; 
        panel.style.height = "750px"; 
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

    // 2. Display "Thinking" state (Đã đổi theo ý đại ca)
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
            // Giữ vibe sweet sibling nhưng vẫn chuyên nghiệp
            loadingElement.innerText = "The connection is a bit weak, sibling. Try again in a sec! 🧸";
        }
    }
};

function addChatMessageUI(text, isUser, id = null) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msg = document.createElement('div');
    if (id) msg.id = id; 
    
    // UI Styling: Đã scale to ra 1.5 lần (Padding p-3 -> p-4, text-sm -> text-base/lg)
    // text-base hoặc text-lg sẽ giúp chữ to hơn, dễ đọc hơn trên khung hình lớn.
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
        // Đổi placeholder theo ý đại ca
        input.placeholder = "Ask me anything...";
        // Scale font size của ô input cho đồng bộ với chatbox to
        input.style.fontSize = "1.1rem"; 
        input.style.padding = "15px";

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendMessage();
        });
    }
});