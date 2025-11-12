/**
 * API Client for Quantum Chat
 */

import { API_BASE_URL, API_ENDPOINTS } from './config.js';

class APIClient {
    // Generate cryptographically secure UUID
    _generateSecureUserId() {
        // Use crypto.randomUUID() if available, fallback to v4 UUID
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback: Generate v4 UUID using crypto.getRandomValues
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }

    async keyExchange(config) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.KEY_EXCHANGE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: this._generateSecureUserId(),
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
