/**
 * API Configuration
 */

// Use environment variables from Vite, with fallback logic
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (isDevelopment ? 'http://localhost:8000' : 'https://quantum-chat-backend.onrender.com');

export const WS_BASE_URL = import.meta.env.VITE_WS_URL ||
    (isDevelopment ? 'ws://localhost:8000' : 'wss://quantum-chat-backend.onrender.com');

export const API_ENDPOINTS = {
    KEY_EXCHANGE: '/api/key-exchange',
    SEND_MESSAGE: '/api/send-message',
    DECRYPT_MESSAGE: '/api/decrypt-message',
    SESSIONS: '/api/sessions',
    WEBSOCKET: (sessionId) => `/ws/${sessionId}`
};
