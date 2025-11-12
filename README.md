# Quantum Chat

## Quantum Key Distribution-Based Secure Communication System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-teal)
![License](https://img.shields.io/badge/license-MIT-yellow)

A full-stack implementation of the **BB84 Quantum Key Distribution (QKD) protocol** integrated with classical AES encryption to demonstrate future-proof secure communication. This project simulates quantum key exchange without requiring quantum hardware and provides an educational platform for understanding quantum cryptography principles.

### Team: Quantum Chads

---

## 🌟 Features

### Core Capabilities

- **BB84 Protocol Simulation**: Complete implementation of the Bennett-Brassard 1984 quantum key distribution protocol
- **Eavesdropping Detection**: Automatic detection of man-in-the-middle attacks via Quantum Bit Error Rate (QBER) analysis
- **Secure Messaging**: Real-time encrypted chat using quantum-generated keys with AES/Fernet encryption
- **WebSocket Communication**: Live bidirectional messaging with automatic encryption/decryption
- **Interactive Visualization**: Real-time display of protocol statistics, QBER metrics, and security status
- **Educational Platform**: Demonstrates quantum cryptography concepts without expensive hardware

### Security Features

- **Information-Theoretic Security**: Security based on quantum mechanics, not computational difficulty
- **Automatic Intrusion Detection**: QBER threshold monitoring (default: 11%)
- **Key Sifting**: Basis comparison and matching for secure key generation
- **Error Correction**: Sample-based error rate estimation
- **Privacy Amplification**: Final key generation with configurable length (64-2048 bits)

---

## 🏗️ Architecture

```
quantum-chat/
├── backend/                    # Python/FastAPI backend
│   ├── bb84/                   # BB84 protocol implementation
│   │   ├── qubit.py           # Quantum bit representation
│   │   ├── alice.py           # Sender (Alice) logic
│   │   ├── bob.py             # Receiver (Bob) logic
│   │   ├── eve.py             # Eavesdropper (Eve) simulation
│   │   └── protocol.py        # BB84 protocol coordinator
│   ├── encryption/            # Cryptography module
│   │   └── crypto.py          # AES/Fernet integration
│   ├── api/                   # FastAPI application
│   │   ├── main.py            # API endpoints & WebSocket
│   │   └── session_manager.py # Session handling
│   ├── models/                # Pydantic schemas
│   │   └── schemas.py         # Request/response models
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # Vanilla JS frontend
│   ├── public/
│   │   └── index.html         # Entry HTML
│   ├── src/
│   │   ├── main.js            # Application entry point
│   │   ├── api/               # API client
│   │   │   ├── config.js      # API configuration
│   │   │   └── client.js      # HTTP client
│   │   ├── components/        # UI components
│   │   │   ├── KeyExchange.js # BB84 key exchange UI
│   │   │   ├── ChatInterface.js # Secure chat UI
│   │   │   └── Visualization.js # Protocol visualization
│   │   └── styles/
│   │       └── main.css       # Styling
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite configuration
│
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Docker & Docker Compose** (optional)

### Option 1: Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Option 2: Docker Compose

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`

### Option 3: Deploy to Render.com

Deploy to the cloud with one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:

1. Fork this repository
2. Sign up at [Render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml` and deploy both services

**Live URLs:**
- Frontend: `https://quantum-chat-frontend.onrender.com`
- Backend: `https://quantum-chat-backend.onrender.com`

📘 **Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions, troubleshooting, and custom domain setup.

---

## 📖 How It Works

### BB84 Protocol Flow

1. **Qubit Preparation (Alice)**
   - Generates random bits (0 or 1)
   - Selects random bases (rectilinear or diagonal)
   - Prepares qubits in chosen states

2. **Quantum Channel Transmission**
   - Qubits transmitted to Bob
   - Optional: Eve intercepts and measures (introduces errors)

3. **Measurement (Bob)**
   - Bob measures qubits in random bases
   - Records measurement results

4. **Basis Comparison (Classical Channel)**
   - Alice and Bob publicly compare bases
   - Keep bits where bases matched (key sifting)

5. **Error Estimation**
   - Sample subset of bits to calculate QBER
   - If QBER > threshold → abort (eavesdropping detected)

6. **Error Correction & Privacy Amplification**
   - Remove sampled bits
   - Generate final key of desired length

7. **Secure Communication**
   - Use quantum key with AES/Fernet encryption
   - Exchange encrypted messages via WebSocket

### QBER Analysis

**Quantum Bit Error Rate (QBER)** = (Number of errors) / (Total bits compared)

- **No eavesdropping**: QBER ≈ 0% (only natural noise)
- **With Eve**: QBER ≈ 25% (Eve uses wrong basis 50% of the time)
- **Threshold**: Typically 11% for BB84
- **Action**: If QBER > threshold → key exchange aborted

---

## 🔌 API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/api/key-exchange` | POST | Initiate BB84 key exchange |
| `/api/send-message` | POST | Encrypt and send message |
| `/api/decrypt-message` | POST | Decrypt message |
| `/api/sessions` | GET | List active sessions |
| `/api/sessions/{id}` | GET | Get session details |
| `/api/sessions/{id}` | DELETE | Delete session |
| `/health` | GET | Health check |

### WebSocket

```
ws://localhost:8000/ws/{session_id}
```

**Client → Server Messages:**
```json
{
  "type": "send_message",
  "sender": "alice",
  "message": "Hello, Bob!"
}
```

**Server → Client Messages:**
```json
{
  "type": "new_message",
  "data": {
    "sender": "alice",
    "ciphertext": "...",
    "timestamp": "2025-11-12T10:30:00Z"
  }
}
```

---

## 🧪 Testing

### Run BB84 Protocol Test

```python
from backend.bb84 import BB84Protocol

# Test without eavesdropper
protocol = BB84Protocol(key_length=256, enable_eve=False)
result = protocol.run()
print(f"Success: {result['success']}")
print(f"QBER: {result['qber']:.2%}")
print(f"Key: {result['final_key'][:32]}...")

# Test with eavesdropper
protocol = BB84Protocol(key_length=256, enable_eve=True, eve_intercept_prob=1.0)
result = protocol.run()
print(f"Error detected: {result['error_detected']}")
print(f"QBER: {result['qber']:.2%}")
```

### Expected Results

**Without Eve:**
- Success: `True`
- QBER: `0-2%` (minimal natural errors)
- Key established successfully

**With Eve (100% interception):**
- Success: `False` (if QBER > 11%)
- QBER: `~25%` (quantum measurement disturbance)
- Error detected: `True`

---

## 📊 Configuration Options

### BB84 Parameters

```json
{
  "key_length": 256,           // 64-2048 bits
  "enable_eve": false,         // Enable eavesdropping simulation
  "eve_intercept_prob": 1.0,   // 0.0-1.0 (probability Eve intercepts each qubit)
  "qber_threshold": 0.11       // 0.0-1.0 (max acceptable error rate)
}
```

### Environment Variables

```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## 🎓 Educational Use Cases

### Use Case 1: Secure Messaging Demo
Run the full application to demonstrate quantum-secured chat between Alice and Bob, with optional Eve simulation to show intrusion detection.

### Use Case 2: QBER Threshold Testing
Experiment with different `eve_intercept_prob` values (0.1, 0.5, 1.0) to observe how QBER increases with interception attempts.

### Use Case 3: Key Generation Efficiency
Compare initial qubit count vs. final key length to understand the overhead of quantum key distribution (typically 25-50% efficiency).

### Use Case 4: Integration with Classical Crypto
Demonstrate how quantum keys seamlessly integrate with AES encryption for practical secure communication.

---

## 🛡️ Security Considerations

### What This Project Demonstrates

✅ **Eavesdropping detection** via QBER analysis
✅ **Information-theoretic security** principles
✅ **Quantum-classical cryptography integration**
✅ **Future-proof key exchange** resistant to quantum computers

### Limitations

⚠️ **Simulation only** - not using real quantum hardware
⚠️ **No authentication** - vulnerable to man-in-the-middle on classical channel
⚠️ **Local/demo use** - not production-grade infrastructure
⚠️ **No key storage** - keys only exist in session memory

### Production Considerations

For real-world deployment, you would need:
- Actual quantum hardware (photon sources, single-photon detectors)
- Authenticated classical channel (prevent MITM on basis comparison)
- Secure key storage (HSM, encrypted databases)
- Network security (TLS for classical communication)

---

## 📚 References

1. **Bennett, C. H., & Brassard, G.** (1984). *Quantum Cryptography: Public Key Distribution and Coin Tossing*. IEEE International Conference on Computers, Systems and Signal Processing.

2. **Gisin, N., et al.** (2002). *Quantum Cryptography*. Reviews of Modern Physics, 74(1), 145-195.

3. **Scarani, V., et al.** (2009). *The Security of Practical Quantum Key Distribution*. Reviews of Modern Physics, 81(3), 1301-1350.

4. **Reference Implementation**: [BB84 Project](https://github.com/qwertystars/BB84)

---

## 🤝 Contributing

This is an educational project by Team Quantum Chads. Contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**Quantum Chads**
November 2025

### Project Links

- **Current Repository**: [https://github.com/qwertystars/quantum-chat](https://github.com/qwertystars/quantum-chat)
- **Reference Project**: [https://github.com/qwertystars/BB84](https://github.com/qwertystars/BB84)
- **Live Demo**: https://quantum-chat.srijan.dpdns.org (TBD)

---

## 🎯 Future Enhancements

- [ ] Implement E91 and B92 QKD protocols
- [ ] Add file encryption/decryption
- [ ] Multi-party secure communication
- [ ] Integration with real quantum hardware (IBM Qiskit)
- [ ] Blockchain-based tamper-proof audit logs
- [ ] Mobile app (React Native)
- [ ] Advanced QBER visualization with charts

---

## 💡 Acknowledgments

Special thanks to:
- Charles Bennett and Gilles Brassard for the BB84 protocol
- The quantum computing and cryptography research community
- FastAPI and Python Cryptography library maintainers

---

**For questions, issues, or collaboration opportunities, please open an issue on GitHub.**
