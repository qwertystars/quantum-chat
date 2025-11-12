"""
Pydantic models for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class BB84Config(BaseModel):
    """Configuration for BB84 protocol execution."""
    key_length: int = Field(default=256, ge=64, le=2048, description="Desired key length in bits")
    enable_eve: bool = Field(default=False, description="Enable eavesdropping simulation")
    eve_intercept_prob: float = Field(default=1.0, ge=0.0, le=1.0, description="Eve interception probability")
    qber_threshold: float = Field(default=0.11, ge=0.0, le=1.0, description="Maximum acceptable QBER")


class BB84Result(BaseModel):
    """Result of BB84 protocol execution."""
    success: bool
    key_established: bool
    final_key: str
    key_length: int
    qber: Optional[float]
    qber_threshold: float
    error_detected: bool
    eavesdropping_enabled: bool
    alice_state: Dict[str, Any]
    bob_state: Dict[str, Any]
    eve_state: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None


class ChatMessage(BaseModel):
    """Chat message model."""
    sender: str = Field(..., description="Message sender (alice or bob)")
    message: str = Field(..., description="Message content")
    encrypted: bool = Field(default=False, description="Whether message is encrypted")
    timestamp: Optional[str] = None


class EncryptedMessage(BaseModel):
    """Encrypted message model."""
    sender: str
    ciphertext: str
    timestamp: str


class KeyExchangeRequest(BaseModel):
    """Request to initiate key exchange."""
    user_id: str = Field(..., description="User identifier")
    config: BB84Config = Field(default_factory=BB84Config)


class KeyExchangeResponse(BaseModel):
    """Response from key exchange."""
    session_id: str
    quantum_key: str
    bb84_result: BB84Result


class SendMessageRequest(BaseModel):
    """Request to send encrypted message."""
    session_id: str
    sender: str
    message: str


class SendMessageResponse(BaseModel):
    """Response after sending message."""
    success: bool
    encrypted_message: Optional[EncryptedMessage] = None
    error: Optional[str] = None


class DecryptMessageRequest(BaseModel):
    """Request to decrypt message."""
    session_id: str
    ciphertext: str


class DecryptMessageResponse(BaseModel):
    """Response with decrypted message."""
    success: bool
    plaintext: Optional[str] = None
    error: Optional[str] = None


class SessionInfo(BaseModel):
    """Information about a chat session."""
    session_id: str
    key_fingerprint: str  # Non-reversible hash, not raw key
    key_length: int
    qber: Optional[float]
    created_at: str
    messages: List[EncryptedMessage]
