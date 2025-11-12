"""
Cryptographic utilities for encrypting/decrypting messages using BB84-generated keys.
"""
import base64
import hashlib
import hmac
from cryptography.fernet import Fernet
from typing import Tuple


class QuantumCrypto:
    """Handles encryption and decryption using quantum-generated keys."""

    def __init__(self, quantum_key: str):
        """
        Initialize with a quantum-generated key.

        Args:
            quantum_key: Hexadecimal string key from BB84 protocol
        """
        self.quantum_key = quantum_key
        self.fernet_key = self._derive_fernet_key(quantum_key)
        self.fernet = Fernet(self.fernet_key)

    @staticmethod
    def _derive_fernet_key(hex_key: str) -> bytes:
        """
        Derive a Fernet-compatible key from the quantum key.
        Fernet requires a 32-byte URL-safe base64-encoded key.

        Args:
            hex_key: Hexadecimal string key

        Returns:
            Base64-encoded 32-byte key suitable for Fernet
        """
        # Convert hex to bytes
        key_bytes = bytes.fromhex(hex_key)

        # Hash to ensure we have exactly 32 bytes
        hashed = hashlib.sha256(key_bytes).digest()

        # Encode to base64 for Fernet
        return base64.urlsafe_b64encode(hashed)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a message.

        Args:
            plaintext: Message to encrypt

        Returns:
            Encrypted message as string (Fernet already produces URL-safe base64)
        """
        encrypted_bytes = self.fernet.encrypt(plaintext.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')

    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt a message.

        Args:
            ciphertext: Encrypted message string

        Returns:
            Decrypted plaintext message
        """
        encrypted_bytes = ciphertext.encode('utf-8')
        decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
        return decrypted_bytes.decode('utf-8')

    def encrypt_file(self, file_data: bytes) -> bytes:
        """
        Encrypt file data.

        Args:
            file_data: Raw file bytes

        Returns:
            Encrypted file data
        """
        return self.fernet.encrypt(file_data)

    def decrypt_file(self, encrypted_data: bytes) -> bytes:
        """
        Decrypt file data.

        Args:
            encrypted_data: Encrypted file bytes

        Returns:
            Decrypted file data
        """
        return self.fernet.decrypt(encrypted_data)

    @staticmethod
    def verify_keys_match(key1: str, key2: str) -> bool:
        """
        Verify that two quantum keys match using constant-time comparison.

        Args:
            key1: First quantum key (hex string)
            key2: Second quantum key (hex string)

        Returns:
            True if keys match, False otherwise
        """
        try:
            key1_bytes = bytes.fromhex(key1)
            key2_bytes = bytes.fromhex(key2)
            return hmac.compare_digest(key1_bytes, key2_bytes)
        except (ValueError, TypeError):
            # Invalid hex string
            return False


def create_secure_channel(quantum_key: str) -> QuantumCrypto:
    """
    Create a secure communication channel using a quantum-generated key.

    Args:
        quantum_key: Hexadecimal string key from BB84 protocol

    Returns:
        QuantumCrypto instance for encryption/decryption
    """
    return QuantumCrypto(quantum_key)
