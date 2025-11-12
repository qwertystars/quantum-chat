/**
 * API Client for Quantum Chat
 */

import { API_BASE_URL, API_ENDPOINTS } from './config.js';

class APIClient {
    async keyExchange(config) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.KEY_EXCHANGE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: 'user_' + Date.now(),
                config: config
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Key exchange failed');
        }

        return await response.json();
    }

    async sendMessage(sessionId, sender, message) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                sender: sender,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();
    }

    async decryptMessage(sessionId, ciphertext) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DECRYPT_MESSAGE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                ciphertext: ciphertext
            })
        });

        if (!response.ok) {
            throw new Error('Failed to decrypt message');
        }

        return await response.json();
    }

    async getSessions() {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SESSIONS}`);

        if (!response.ok) {
            throw new Error('Failed to get sessions');
        }

        return await response.json();
    }

    async getSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SESSIONS}/${sessionId}`);

        if (!response.ok) {
            throw new Error('Failed to get session');
        }

        return await response.json();
    }
}

export const apiClient = new APIClient();
