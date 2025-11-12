/**
 * Quantum Chat - Main Application Entry Point
 */

import { API_BASE_URL } from './api/config.js';
import { initKeyExchange } from './components/KeyExchange.js';
import { initChatInterface } from './components/ChatInterface.js';
import { initVisualization } from './components/Visualization.js';

class QuantumChatApp {
    constructor() {
        this.currentSession = null;
        this.websocket = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHomePage();
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            }
        });
    }

    navigateTo(page) {
        switch (page) {
            case 'home':
                this.loadHomePage();
                break;
            case 'key-exchange':
                this.loadKeyExchangePage();
                break;
            case 'chat':
                this.loadChatPage();
                break;
            case 'about':
                this.loadAboutPage();
                break;
        }
    }

    loadHomePage() {
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="app-container">
                <header class="header">
                    <div class="logo">
                        <span class="quantum-symbol">⚛️</span>
                        <h1>Quantum Chat</h1>
                    </div>
                    <nav class="nav">
                        <a href="#" data-page="home" class="nav-link active">Home</a>
                        <a href="#" data-page="key-exchange" class="nav-link">Key Exchange</a>
                        <a href="#" data-page="about" class="nav-link">About</a>
                    </nav>
                </header>

                <main class="main-content">
                    <section class="hero">
                        <h2>Quantum Key Distribution-Based Secure Communication</h2>
                        <p class="hero-subtitle">
                            Experience the future of secure messaging with BB84 quantum key distribution protocol
                        </p>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-large" data-page="key-exchange">
                                🔐 Start Secure Chat
                            </button>
                            <button class="btn btn-secondary btn-large" data-page="about">
                                📚 Learn More
                            </button>
                        </div>
                    </section>

                    <section class="features">
                        <div class="feature-card">
                            <div class="feature-icon">🔑</div>
                            <h3>Quantum Key Distribution</h3>
                            <p>Generate secure encryption keys using the BB84 protocol</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🕵️</div>
                            <h3>Eavesdropping Detection</h3>
                            <p>Detect intrusions through Quantum Bit Error Rate (QBER) analysis</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">💬</div>
                            <h3>Secure Messaging</h3>
                            <p>Exchange encrypted messages with quantum-generated keys</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📊</div>
                            <h3>Real-time Visualization</h3>
                            <p>Visualize the quantum communication process</p>
                        </div>
                    </section>
                </main>

                <footer class="footer">
                    <p>&copy; 2025 Quantum Chads Team | BB84 QKD Implementation</p>
                </footer>
            </div>
        `;
    }

    loadKeyExchangePage() {
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="app-container">
                <header class="header">
                    <div class="logo">
                        <span class="quantum-symbol">⚛️</span>
                        <h1>Quantum Chat</h1>
                    </div>
                    <nav class="nav">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="key-exchange" class="nav-link active">Key Exchange</a>
                        <a href="#" data-page="about" class="nav-link">About</a>
                    </nav>
                </header>

                <main class="main-content">
                    <section class="key-exchange-section">
                        <h2>BB84 Quantum Key Exchange</h2>
                        <div id="key-exchange-container"></div>
                    </section>
                </main>

                <footer class="footer">
                    <p>&copy; 2025 Quantum Chads Team</p>
                </footer>
            </div>
        `;

        initKeyExchange((sessionData) => {
            this.currentSession = sessionData;
            this.loadChatPage();
        });
    }

    loadChatPage() {
        if (!this.currentSession) {
            this.loadKeyExchangePage();
            return;
        }

        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="app-container">
                <header class="header">
                    <div class="logo">
                        <span class="quantum-symbol">⚛️</span>
                        <h1>Quantum Chat</h1>
                    </div>
                    <nav class="nav">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="key-exchange" class="nav-link">New Session</a>
                        <a href="#" data-page="about" class="nav-link">About</a>
                    </nav>
                </header>

                <main class="main-content chat-layout">
                    <div class="chat-container">
                        <div id="chat-interface"></div>
                    </div>
                    <div class="visualization-container">
                        <div id="visualization"></div>
                    </div>
                </main>

                <footer class="footer">
                    <p>&copy; 2025 Quantum Chads Team</p>
                </footer>
            </div>
        `;

        initChatInterface(this.currentSession);
        initVisualization(this.currentSession);
    }

    loadAboutPage() {
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="app-container">
                <header class="header">
                    <div class="logo">
                        <span class="quantum-symbol">⚛️</span>
                        <h1>Quantum Chat</h1>
                    </div>
                    <nav class="nav">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="key-exchange" class="nav-link">Key Exchange</a>
                        <a href="#" data-page="about" class="nav-link active">About</a>
                    </nav>
                </header>

                <main class="main-content">
                    <section class="about-section">
                        <h2>About Quantum Chat</h2>

                        <div class="about-content">
                            <h3>What is BB84?</h3>
                            <p>
                                BB84 is a quantum key distribution protocol proposed by Charles Bennett and
                                Gilles Brassard in 1984. It uses quantum mechanics to securely distribute
                                encryption keys between two parties.
                            </p>

                            <h3>How It Works</h3>
                            <ol>
                                <li><strong>Qubit Transmission:</strong> Alice sends qubits encoded in random bases</li>
                                <li><strong>Measurement:</strong> Bob measures qubits in random bases</li>
                                <li><strong>Basis Comparison:</strong> Alice and Bob compare bases publicly</li>
                                <li><strong>Key Sifting:</strong> Keep only bits where bases matched</li>
                                <li><strong>Error Estimation:</strong> Calculate QBER to detect eavesdropping</li>
                                <li><strong>Privacy Amplification:</strong> Generate final secure key</li>
                            </ol>

                            <h3>Eavesdropping Detection</h3>
                            <p>
                                When Eve (eavesdropper) intercepts qubits, she must measure them. This
                                measurement disturbs the quantum state, introducing errors. By calculating
                                the Quantum Bit Error Rate (QBER), Alice and Bob can detect Eve's presence.
                            </p>

                            <h3>Key Features</h3>
                            <ul>
                                <li>Information-theoretic security (not just computational)</li>
                                <li>Automatic eavesdropping detection via QBER</li>
                                <li>Integration with classical encryption (AES/Fernet)</li>
                                <li>Real-time secure messaging</li>
                                <li>Educational visualization of quantum concepts</li>
                            </ul>

                            <h3>Technology Stack</h3>
                            <ul>
                                <li><strong>Backend:</strong> Python, FastAPI, WebSockets</li>
                                <li><strong>Cryptography:</strong> Cryptography library (Fernet/AES)</li>
                                <li><strong>Frontend:</strong> Vanilla JavaScript, HTML5, CSS3</li>
                                <li><strong>Quantum Simulation:</strong> NumPy</li>
                            </ul>

                            <h3>Team: Quantum Chads</h3>
                            <p>
                                This project demonstrates how quantum cryptography can enhance
                                cybersecurity without requiring expensive quantum hardware.
                            </p>
                        </div>
                    </section>
                </main>

                <footer class="footer">
                    <p>&copy; 2025 Quantum Chads Team | Version 1.0</p>
                </footer>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new QuantumChatApp();
});
