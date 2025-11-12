"""
Session manager for handling quantum key exchange sessions.
"""
import uuid
import hashlib
from datetime import datetime
from typing import Dict, Optional, List
from ..bb84 import BB84Protocol
from ..encryption import QuantumCrypto
from ..models.schemas import EncryptedMessage


class Session:
    """Represents a quantum-secured chat session."""

    def __init__(self, session_id: str, quantum_key: str, bb84_result: dict):
        self.session_id = session_id
        self.quantum_key = quantum_key
        self.bb84_result = bb84_result
        self.crypto = QuantumCrypto(quantum_key)
        self.messages: List[EncryptedMessage] = []
        self.created_at = datetime.utcnow().isoformat()

    def encrypt_message(self, sender: str, message: str) -> EncryptedMessage:
        """Encrypt and store a message."""
        ciphertext = self.crypto.encrypt(message)
        encrypted_msg = EncryptedMessage(
            sender=sender,
            ciphertext=ciphertext,
            timestamp=datetime.utcnow().isoformat()
        )
        self.messages.append(encrypted_msg)
        return encrypted_msg

    def decrypt_message(self, ciphertext: str) -> str:
        """Decrypt a message."""
        return self.crypto.decrypt(ciphertext)

    def get_info(self) -> dict:
        """Get session information."""
        # Use non-reversible hash fingerprint instead of exposing key bits
        key_fingerprint = hashlib.sha256(self.quantum_key.encode()).hexdigest()[:16]
        return {
            'session_id': self.session_id,
            'key_fingerprint': key_fingerprint,  # Non-reversible hash, not raw key
            'key_length': self.bb84_result.get('key_length', 0),
            'qber': self.bb84_result.get('qber'),
            'created_at': self.created_at,
            'message_count': len(self.messages)
        }


class SessionManager:
    """Manages multiple quantum-secured chat sessions."""

    def __init__(self):
        self.sessions: Dict[str, Session] = {}

    def create_session(self, config: dict) -> tuple[str, str, dict]:
        """
        Create a new session with BB84 key exchange.

        Args:
            config: BB84 configuration parameters

        Returns:
            Tuple of (session_id, quantum_key, bb84_result)
        """
        # Run BB84 protocol
        protocol = BB84Protocol(
            key_length=config.get('key_length', 256),
            enable_eve=config.get('enable_eve', False),
            eve_intercept_prob=config.get('eve_intercept_prob', 1.0),
            qber_threshold=config.get('qber_threshold', 0.11)
        )

        bb84_result = protocol.run()

        if not bb84_result['success']:
            raise ValueError(f"BB84 protocol failed: {bb84_result.get('failure_reason', 'Unknown error')}")

        # Create session
        session_id = str(uuid.uuid4())
        quantum_key = bb84_result['final_key']

        session = Session(session_id, quantum_key, bb84_result)
        self.sessions[session_id] = session

        return session_id, quantum_key, bb84_result

    def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def list_sessions(self) -> List[dict]:
        """List all active sessions."""
        return [session.get_info() for session in self.sessions.values()]


# Global session manager instance
session_manager = SessionManager()
