/**
 * API Configuration
 */

export const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://quantum-chat.srijan.dpdns.org';

export const WS_BASE_URL = window.location.hostname === 'localhost'
    ? 'ws://localhost:8000'
    : 'wss://quantum-chat.srijan.dpdns.org';

export const API_ENDPOINTS = {
    KEY_EXCHANGE: '/api/key-exchange',
    SEND_MESSAGE: '/api/send-message',
    DECRYPT_MESSAGE: '/api/decrypt-message',
    SESSIONS: '/api/sessions',
    WEBSOCKET: (sessionId) => `/ws/${sessionId}`
};
