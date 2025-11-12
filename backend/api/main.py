"""
FastAPI main application for Quantum Chat.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import os
from datetime import datetime

from ..models.schemas import (
    BB84Config,
    BB84Result,
    KeyExchangeRequest,
    KeyExchangeResponse,
    SendMessageRequest,
    SendMessageResponse,
    DecryptMessageRequest,
    DecryptMessageResponse,
    SessionInfo,
    ChatMessage
)
from .session_manager import session_manager

app = FastAPI(
    title="Quantum Chat API",
    description="Quantum Key Distribution-Based Secure Communication System using BB84",
    version="1.0.0"
)

# CORS configuration - allow frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "https://quantum-chat-frontend.onrender.com",
    "https://quantum-chat.srijan.dpdns.org"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json(message)


manager = ConnectionManager()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Quantum Chat API",
        "version": "1.0.0",
        "description": "BB84 Quantum Key Distribution-Based Secure Communication",
        "endpoints": {
            "docs": "/docs",
            "key_exchange": "/api/key-exchange",
            "send_message": "/api/send-message",
            "decrypt_message": "/api/decrypt-message",
            "sessions": "/api/sessions",
            "websocket": "/ws/{session_id}"
        }
    }


@app.post("/api/key-exchange", response_model=KeyExchangeResponse)
async def key_exchange(request: KeyExchangeRequest):
    """
    Initiate BB84 quantum key exchange.

    This endpoint simulates the BB84 protocol to generate a shared quantum key
    between Alice and Bob. Optionally enables Eve (eavesdropper) to demonstrate
    QBER-based intrusion detection.
    """
    try:
        config = request.config.dict()
        session_id, quantum_key, bb84_result = session_manager.create_session(config)

        return KeyExchangeResponse(
            session_id=session_id,
            quantum_key=quantum_key,
            bb84_result=BB84Result(**bb84_result)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Key exchange failed: {str(e)}")


@app.post("/api/send-message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest):
    """
    Encrypt and send a message using the quantum-generated key.
    """
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        encrypted_msg = session.encrypt_message(request.sender, request.message)

        # Broadcast to WebSocket clients
        await manager.broadcast({
            "type": "new_message",
            "data": encrypted_msg.dict()
        }, request.session_id)

        return SendMessageResponse(
            success=True,
            encrypted_message=encrypted_msg
        )
    except Exception as e:
        return SendMessageResponse(
            success=False,
            error=str(e)
        )


@app.post("/api/decrypt-message", response_model=DecryptMessageResponse)
async def decrypt_message(request: DecryptMessageRequest):
    """
    Decrypt a message using the quantum-generated key.
    """
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        plaintext = session.decrypt_message(request.ciphertext)
        return DecryptMessageResponse(
            success=True,
            plaintext=plaintext
        )
    except Exception as e:
        return DecryptMessageResponse(
            success=False,
            error=str(e)
        )


@app.get("/api/sessions", response_model=List[dict])
async def list_sessions():
    """
    List all active quantum-secured sessions.
    """
    return session_manager.list_sessions()


@app.get("/api/sessions/{session_id}", response_model=dict)
async def get_session(session_id: str):
    """
    Get information about a specific session.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        **session.get_info(),
        "messages": [msg.dict() for msg in session.messages]
    }


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a session.
    """
    if session_manager.delete_session(session_id):
        return {"success": True, "message": "Session deleted"}
    raise HTTPException(status_code=404, detail="Session not found")


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time encrypted chat.
    """
    # Verify session exists
    session = session_manager.get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return

    await manager.connect(websocket, session_id)

    try:
        # Send session info
        await websocket.send_json({
            "type": "session_info",
            "data": session.get_info()
        })

        # Send message history
        await websocket.send_json({
            "type": "message_history",
            "data": [msg.dict() for msg in session.messages]
        })

        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data.get("type") == "send_message":
                sender = message_data.get("sender", "anonymous")
                message = message_data.get("message", "")

                # Encrypt and broadcast
                encrypted_msg = session.encrypt_message(sender, message)
                await manager.broadcast({
                    "type": "new_message",
                    "data": encrypted_msg.dict()
                }, session_id)

            elif message_data.get("type") == "decrypt_message":
                ciphertext = message_data.get("ciphertext", "")
                try:
                    plaintext = session.decrypt_message(ciphertext)
                    await websocket.send_json({
                        "type": "decrypted_message",
                        "data": {
                            "ciphertext": ciphertext,
                            "plaintext": plaintext
                        }
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": f"Decryption failed: {str(e)}"}
                    })

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_sessions": len(session_manager.sessions)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
