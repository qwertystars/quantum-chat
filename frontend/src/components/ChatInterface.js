/**
 * Chat Interface Component
 */

import { WS_BASE_URL, API_ENDPOINTS } from '../api/config.js';

export function initChatInterface(sessionData) {
    const container = document.getElementById('chat-interface');

    container.innerHTML = `
        <div class="chat-panel">
            <div class="chat-header">
                <h3>Quantum-Secured Chat</h3>
                <div class="session-info">
                    <span class="session-badge">🔐 Secure</span>
                    <span class="qber-badge">QBER: ${(sessionData.bb84_result.qber * 100).toFixed(2)}%</span>
                </div>
            </div>

            <div class="chat-messages" id="chat-messages">
                <div class="system-message">
                    <p>✓ Quantum key established successfully</p>
                    <p>Session ID: <code>${sessionData.session_id.substring(0, 8)}...</code></p>
                </div>
            </div>

            <div class="chat-input-container">
                <div class="user-selector">
                    <label>
                        <input type="radio" name="sender" value="alice" checked>
                        Alice
                    </label>
                    <label>
                        <input type="radio" name="sender" value="bob">
                        Bob
                    </label>
                </div>
                <div class="chat-input-wrapper">
                    <input
                        type="text"
                        id="message-input"
                        class="chat-input"
                        placeholder="Type your message..."
                        autocomplete="off"
                    >
                    <button class="btn btn-primary" id="send-button">
                        Send 🔒
                    </button>
                </div>
                <div class="encryption-status">
                    <small>All messages are encrypted with quantum-generated key</small>
                </div>
            </div>
        </div>
    `;

    setupChatWebSocket(sessionData);
}

function setupChatWebSocket(sessionData) {
    const wsUrl = `${WS_BASE_URL}${API_ENDPOINTS.WEBSOCKET(sessionData.session_id)}`;
    const ws = new WebSocket(wsUrl);

    const messagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    ws.onopen = () => {
        console.log('WebSocket connected');
        addSystemMessage('Connected to secure channel');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'session_info':
                console.log('Session info:', data.data);
                break;

            case 'message_history':
                data.data.forEach(msg => {
                    addEncryptedMessage(msg);
                });
                break;

            case 'new_message':
                addEncryptedMessage(data.data);
                break;

            case 'decrypted_message':
                console.log('Decrypted:', data.data);
                break;

            case 'error':
                addSystemMessage(`Error: ${data.data.message}`, 'error');
                break;
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addSystemMessage('Connection error', 'error');
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        addSystemMessage('Disconnected from secure channel', 'warning');
    };

    // Send message
    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (!message) return;

        const sender = document.querySelector('input[name="sender"]:checked').value;

        ws.send(JSON.stringify({
            type: 'send_message',
            sender: sender,
            message: message
        }));

        messageInput.value = '';
    };

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addEncryptedMessage(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${msg.sender}`;

        // Request decryption
        ws.send(JSON.stringify({
            type: 'decrypt_message',
            ciphertext: msg.ciphertext
        }));

        const timestamp = new Date(msg.timestamp).toLocaleTimeString();

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender">${msg.sender}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">
                <div class="encrypted-preview">
                    <span class="lock-icon">🔒</span>
                    <code class="ciphertext">${msg.ciphertext.substring(0, 40)}...</code>
                </div>
                <div class="decrypted-content" id="msg-${msg.timestamp}">
                    <div class="loading-dots">Decrypting...</div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Listen for decryption
        const originalOnMessage = ws.onmessage;
        ws.onmessage = (event) => {
            originalOnMessage(event);
            const data = JSON.parse(event.data);
            if (data.type === 'decrypted_message' && data.data.ciphertext === msg.ciphertext) {
                const decryptedDiv = document.getElementById(`msg-${msg.timestamp}`);
                if (decryptedDiv) {
                    decryptedDiv.innerHTML = `
                        <span class="unlock-icon">🔓</span>
                        <p class="plaintext">${data.data.plaintext}</p>
                    `;
                }
            }
        };
    }

    function addSystemMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `system-message ${type}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
