/**
 * API Configuration
 */

// Use environment variables from Vite, with fallback logic
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// In production with unified service, use same origin; in dev, use separate backend
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (isDevelopment ? 'http://localhost:8000' : window.location.origin);

export const WS_BASE_URL = import.meta.env.VITE_WS_URL ||
    (isDevelopment ? 'ws://localhost:8000' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);

export const API_ENDPOINTS = {
    KEY_EXCHANGE: '/api/key-exchange',
    SEND_MESSAGE: '/api/send-message',
    DECRYPT_MESSAGE: '/api/decrypt-message',
    SESSIONS: '/api/sessions',
    WEBSOCKET: (sessionId) => `/ws/${sessionId}`
};
