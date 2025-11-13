(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function e(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=e(a);fetch(a.href,i)}})();const b=window.location.hostname==="localhost",h=b?"http://localhost:8000":window.location.origin,g=b?"ws://localhost:8000":`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}`,v={KEY_EXCHANGE:"/api/key-exchange",SEND_MESSAGE:"/api/send-message",DECRYPT_MESSAGE:"/api/decrypt-message",SESSIONS:"/api/sessions",WEBSOCKET:n=>`/ws/${n}`};class y{_generateSecureUserId(){if(typeof crypto<"u"&&crypto.randomUUID)return crypto.randomUUID();const t=new Uint8Array(16);crypto.getRandomValues(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;const e=Array.from(t,s=>s.toString(16).padStart(2,"0")).join("");return`${e.slice(0,8)}-${e.slice(8,12)}-${e.slice(12,16)}-${e.slice(16,20)}-${e.slice(20)}`}async keyExchange(t){const e=await fetch(`${h}${v.KEY_EXCHANGE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:this._generateSecureUserId(),config:t})});if(!e.ok){const s=await e.json();throw new Error(s.detail||"Key exchange failed")}return await e.json()}async sendMessage(t,e,s){const a=await fetch(`${h}${v.SEND_MESSAGE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:t,sender:e,message:s})});if(!a.ok)throw new Error("Failed to send message");return await a.json()}async decryptMessage(t,e){const s=await fetch(`${h}${v.DECRYPT_MESSAGE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:t,ciphertext:e})});if(!s.ok)throw new Error("Failed to decrypt message");return await s.json()}async getSessions(){const t=await fetch(`${h}${v.SESSIONS}`);if(!t.ok)throw new Error("Failed to get sessions");return await t.json()}async getSession(t){const e=await fetch(`${h}${v.SESSIONS}/${t}`);if(!e.ok)throw new Error("Failed to get session");return await e.json()}}const f=new y;function E(n){const t=document.getElementById("key-exchange-container");t.innerHTML=`
        <div class="key-exchange-form">
            <div class="form-section">
                <h3>Configure BB84 Parameters</h3>

                <div class="form-group">
                    <label for="key-length">Key Length (bits)</label>
                    <input type="number" id="key-length" value="256" min="64" max="2048" step="64">
                    <small>Recommended: 256 bits</small>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="enable-eve">
                        Enable Eavesdropping Simulation (Eve)
                    </label>
                </div>

                <div class="form-group eve-config" style="display: none;">
                    <label for="eve-intercept-prob">Eve Interception Probability</label>
                    <input type="range" id="eve-intercept-prob" min="0" max="1" step="0.1" value="1.0">
                    <span id="eve-prob-value">100%</span>
                </div>

                <div class="form-group">
                    <label for="qber-threshold">QBER Threshold</label>
                    <input type="range" id="qber-threshold" min="0" max="0.25" step="0.01" value="0.11">
                    <span id="qber-threshold-value">11%</span>
                    <small>Maximum acceptable error rate (typically 11% for BB84)</small>
                </div>

                <button class="btn btn-primary btn-large" id="start-protocol">
                    🚀 Start BB84 Protocol
                </button>
            </div>

            <div id="protocol-status" class="protocol-status" style="display: none;">
                <div class="loading-spinner"></div>
                <p>Running BB84 protocol...</p>
            </div>

            <div id="protocol-result" class="protocol-result" style="display: none;"></div>
        </div>
    `;const e=document.getElementById("enable-eve"),s=t.querySelector(".eve-config"),a=document.getElementById("eve-intercept-prob"),i=document.getElementById("eve-prob-value"),d=document.getElementById("qber-threshold"),m=document.getElementById("qber-threshold-value"),p=document.getElementById("start-protocol");e.addEventListener("change",c=>{s.style.display=c.target.checked?"block":"none"}),a.addEventListener("input",c=>{i.textContent=`${(c.target.value*100).toFixed(0)}%`}),d.addEventListener("input",c=>{m.textContent=`${(c.target.value*100).toFixed(0)}%`}),p.addEventListener("click",async()=>{const c={key_length:parseInt(document.getElementById("key-length").value),enable_eve:e.checked,eve_intercept_prob:parseFloat(a.value),qber_threshold:parseFloat(d.value)},r=document.getElementById("protocol-status"),o=document.getElementById("protocol-result");r.style.display="block",o.style.display="none",p.disabled=!0;try{const l=await f.keyExchange(c);_(l,o,n)}catch(l){S(l.message,o)}finally{r.style.display="none",p.disabled=!1}})}function _(n,t,e){const s=n.bb84_result;t.innerHTML=`
        <div class="result-card ${s.success?"success":"error"}">
            <div class="result-header">
                <h3>${s.success?"✓ Key Exchange Successful!":"✗ Key Exchange Failed"}</h3>
            </div>

            <div class="result-body">
                ${s.success?`
                    <div class="result-item">
                        <label>Session ID:</label>
                        <code>${n.session_id}</code>
                    </div>
                    <div class="result-item">
                        <label>Quantum Key:</label>
                        <code class="quantum-key">${n.quantum_key.substring(0,32)}...</code>
                    </div>
                    <div class="result-item">
                        <label>Key Length:</label>
                        <span>${s.key_length} bits</span>
                    </div>
                `:`
                    <div class="error-message">
                        <p><strong>Failure Reason:</strong> ${s.failure_reason}</p>
                    </div>
                `}

                <div class="result-item">
                    <label>QBER (Quantum Bit Error Rate):</label>
                    <span class="${s.qber>s.qber_threshold?"error-text":"success-text"}">
                        ${(s.qber*100).toFixed(2)}%
                    </span>
                    ${s.qber>s.qber_threshold?" ⚠️ Above threshold!":" ✓ Within acceptable range"}
                </div>

                ${s.eavesdropping_enabled?`
                    <div class="result-item">
                        <label>Eavesdropper Detected:</label>
                        <span class="${s.error_detected?"error-text":"success-text"}">
                            ${s.error_detected?"Yes - High QBER detected!":"No - Communication secure"}
                        </span>
                    </div>
                `:""}

                <div class="result-stats">
                    <h4>Protocol Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <label>Initial Qubits:</label>
                            <span>${s.alice_state.n_qubits}</span>
                        </div>
                        <div class="stat">
                            <label>Sifted Key Length:</label>
                            <span>${s.alice_state.sifted_key_length} bits</span>
                        </div>
                        <div class="stat">
                            <label>Final Key Length:</label>
                            <span>${s.alice_state.final_key_length} bits</span>
                        </div>
                        <div class="stat">
                            <label>Efficiency:</label>
                            <span>${s.alice_state.n_qubits>0?(s.alice_state.final_key_length/s.alice_state.n_qubits*100).toFixed(1):"0.0"}%</span>
                        </div>
                    </div>
                </div>

                ${s.success?`
                    <button class="btn btn-primary btn-large" id="go-to-chat">
                        💬 Start Secure Chat
                    </button>
                `:`
                    <button class="btn btn-secondary" id="retry-protocol">
                        🔄 Try Again
                    </button>
                `}
            </div>
        </div>
    `,t.style.display="block",s.success?document.getElementById("go-to-chat").addEventListener("click",()=>{e(n)}):document.getElementById("retry-protocol").addEventListener("click",()=>{t.style.display="none",document.getElementById("start-protocol").disabled=!1})}function S(n,t){t.innerHTML=`
        <div class="result-card error">
            <div class="result-header">
                <h3>✗ Error</h3>
            </div>
            <div class="result-body">
                <p class="error-message">${n}</p>
                <button class="btn btn-secondary" id="retry-protocol">
                    🔄 Try Again
                </button>
            </div>
        </div>
    `,t.style.display="block",document.getElementById("retry-protocol").addEventListener("click",()=>{t.style.display="none",document.getElementById("start-protocol").disabled=!1})}function k(n){var i;const t=document.getElementById("chat-interface"),e=(i=n==null?void 0:n.bb84_result)==null?void 0:i.qber,s=typeof e=="number"?`${(e*100).toFixed(2)}%`:"N/A",a=(n==null?void 0:n.session_id)||"unknown";t.innerHTML=`
        <div class="chat-panel">
            <div class="chat-header">
                <h3>Quantum-Secured Chat</h3>
                <div class="session-info">
                    <span class="session-badge">🔐 Secure</span>
                    <span class="qber-badge">QBER: ${s}</span>
                </div>
            </div>

            <div class="chat-messages" id="chat-messages">
                <div class="system-message">
                    <p>✓ Quantum key established successfully</p>
                    <p>Session ID: <code>${a.substring(0,8)}...</code></p>
                </div>
            </div>

            <div class="chat-input-container">
                <div class="user-selector">
                    <label>
                        <input type="radio" name="sender" value="alice" checked>
                        Alice
                    </label>
                    <label>
                        <input type="radio" name="sender" value="bob">
                        Bob
                    </label>
                </div>
                <div class="chat-input-wrapper">
                    <input
                        type="text"
                        id="message-input"
                        class="chat-input"
                        placeholder="Type your message..."
                        autocomplete="off"
                    >
                    <button class="btn btn-primary" id="send-button">
                        Send 🔒
                    </button>
                </div>
                <div class="encryption-status">
                    <small>All messages are encrypted with quantum-generated key</small>
                </div>
            </div>
        </div>
    `,w(n)}function w(n){const t=`${g}${v.WEBSOCKET(n.session_id)}`,e=new WebSocket(t),s=document.getElementById("chat-messages"),a=document.getElementById("message-input"),i=document.getElementById("send-button"),d=new Map;e.onopen=()=>{console.log("WebSocket connected"),c("Connected to secure channel"),i.disabled=!1},e.onmessage=r=>{try{const o=JSON.parse(r.data);switch(o.type){case"session_info":console.log("Session info:",o.data);break;case"message_history":o.data.forEach(u=>{p(u)});break;case"new_message":p(o.data);break;case"decrypted_message":const l=d.get(o.data.ciphertext);if(l){const u=document.getElementById(l.elementId);u&&(u.innerHTML=`
                                <span class="unlock-icon">🔓</span>
                                <p class="plaintext">${o.data.plaintext}</p>
                            `),d.delete(o.data.ciphertext)}break;case"error":c(`Error: ${o.data.message}`,"error");break}}catch(o){console.error("Error parsing WebSocket message:",o)}},e.onerror=r=>{console.error("WebSocket error:",r),c("Connection error","error"),i.disabled=!0},e.onclose=()=>{console.log("WebSocket disconnected"),c("Disconnected from secure channel","warning"),i.disabled=!0};const m=()=>{const r=a.value.trim();if(!r)return;if(e.readyState!==WebSocket.OPEN){c("Cannot send message: connection not ready","error");return}const o=document.querySelector('input[name="sender"]:checked').value;e.send(JSON.stringify({type:"send_message",sender:o,message:r})),a.value=""};i.addEventListener("click",m),a.addEventListener("keypress",r=>{r.key==="Enter"&&m()});function p(r){const o=document.createElement("div");o.className=`chat-message ${r.sender}`;const l=new Date(r.timestamp).toLocaleTimeString(),u=`msg-${r.timestamp}`;o.innerHTML=`
            <div class="message-header">
                <span class="sender">${r.sender}</span>
                <span class="timestamp">${l}</span>
            </div>
            <div class="message-content">
                <div class="encrypted-preview">
                    <span class="lock-icon">🔒</span>
                    <code class="ciphertext">${r.ciphertext.substring(0,40)}...</code>
                </div>
                <div class="decrypted-content" id="${u}">
                    <div class="loading-dots">Decrypting...</div>
                </div>
            </div>
        `,s.appendChild(o),s.scrollTop=s.scrollHeight,d.set(r.ciphertext,{elementId:u}),e.readyState===WebSocket.OPEN&&e.send(JSON.stringify({type:"decrypt_message",ciphertext:r.ciphertext}))}function c(r,o="info"){const l=document.createElement("div");l.className=`system-message ${o}`,l.innerHTML=`<p>${r}</p>`,s.appendChild(l),s.scrollTop=s.scrollHeight}i.disabled=!0}function $(n){const t=document.getElementById("visualization"),e=n.bb84_result;t.innerHTML=`
        <div class="visualization-panel">
            <h3>Protocol Visualization</h3>

            <div class="viz-section">
                <h4>Quantum Key Distribution Flow</h4>
                <div class="flow-diagram">
                    <div class="flow-step">
                        <div class="step-icon">👩‍💻</div>
                        <div class="step-label">Alice</div>
                        <div class="step-desc">Prepares qubits</div>
                    </div>
                    <div class="flow-arrow">→</div>
                    ${e.eavesdropping_enabled?`
                        <div class="flow-step ${e.error_detected?"detected":""}">
                            <div class="step-icon">🕵️</div>
                            <div class="step-label">Eve</div>
                            <div class="step-desc">${e.error_detected?"Detected!":"Intercepting"}</div>
                        </div>
                        <div class="flow-arrow">→</div>
                    `:""}
                    <div class="flow-step">
                        <div class="step-icon">👨‍💻</div>
                        <div class="step-label">Bob</div>
                        <div class="step-desc">Measures qubits</div>
                    </div>
                </div>
            </div>

            <div class="viz-section">
                <h4>QBER Analysis</h4>
                <div class="qber-meter">
                    <div class="meter-bar">
                        <div
                            class="meter-fill ${e.qber>e.qber_threshold?"danger":"safe"}"
                            style="width: ${Math.min(e.qber/e.qber_threshold*100,100)}%"
                        ></div>
                        <div class="meter-threshold" style="left: 100%"></div>
                    </div>
                    <div class="meter-labels">
                        <span>0%</span>
                        <span class="threshold-label">Threshold: ${(e.qber_threshold*100).toFixed(0)}%</span>
                        <span>Current: ${(e.qber*100).toFixed(2)}%</span>
                    </div>
                </div>
                <div class="qber-status ${e.qber>e.qber_threshold?"danger":"safe"}">
                    ${e.qber>e.qber_threshold?"⚠️ High error rate detected - Possible eavesdropping!":"✓ Error rate within acceptable range - Communication secure"}
                </div>
            </div>

            <div class="viz-section">
                <h4>Key Generation Statistics</h4>
                <div class="stats-bars">
                    <div class="stat-bar-item">
                        <label>Initial Qubits</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 100%">
                                ${e.alice_state.n_qubits}
                            </div>
                        </div>
                    </div>
                    <div class="stat-bar-item">
                        <label>After Sifting</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${e.alice_state.sifted_key_length/e.alice_state.n_qubits*100}%">
                                ${e.alice_state.sifted_key_length}
                            </div>
                        </div>
                    </div>
                    <div class="stat-bar-item">
                        <label>Final Key</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill success" style="width: ${e.alice_state.final_key_length/e.alice_state.n_qubits*100}%">
                                ${e.alice_state.final_key_length} bits
                            </div>
                        </div>
                    </div>
                </div>
                <div class="efficiency-metric">
                    <strong>Overall Efficiency:</strong>
                    ${(e.alice_state.final_key_length/e.alice_state.n_qubits*100).toFixed(1)}%
                </div>
            </div>

            <div class="viz-section">
                <h4>Security Status</h4>
                <div class="security-indicators">
                    <div class="indicator ${e.key_established?"success":"error"}">
                        <span class="indicator-icon">${e.key_established?"✓":"✗"}</span>
                        <span class="indicator-label">Key Established</span>
                    </div>
                    <div class="indicator ${e.error_detected?"error":"success"}">
                        <span class="indicator-icon">${e.error_detected?"⚠️":"✓"}</span>
                        <span class="indicator-label">No Intrusion Detected</span>
                    </div>
                    <div class="indicator success">
                        <span class="indicator-icon">🔒</span>
                        <span class="indicator-label">AES Encryption Active</span>
                    </div>
                </div>
            </div>

            ${e.eavesdropping_enabled&&e.eve_state?`
                <div class="viz-section eve-info">
                    <h4>Eavesdropper Activity</h4>
                    <div class="eve-stats">
                        <div class="eve-stat">
                            <label>Qubits Intercepted:</label>
                            <span>${e.eve_state.n_intercepted}</span>
                        </div>
                        <div class="eve-stat">
                            <label>Interception Rate:</label>
                            <span>${(e.eve_state.intercept_probability*100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            `:""}
        </div>
    `}class B{constructor(){this.currentSession=null,this.websocket=null,this.init()}init(){this.setupEventListeners(),this.loadHomePage()}setupEventListeners(){document.addEventListener("click",t=>{if(t.target.matches("[data-page]")){t.preventDefault();const e=t.target.dataset.page;this.navigateTo(e)}})}navigateTo(t){switch(t){case"home":this.loadHomePage();break;case"key-exchange":this.loadKeyExchangePage();break;case"chat":this.loadChatPage();break;case"about":this.loadAboutPage();break}}loadHomePage(){const t=document.getElementById("root");t.innerHTML=`
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
        `}loadKeyExchangePage(){const t=document.getElementById("root");t.innerHTML=`
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
        `,E(e=>{this.currentSession=e,this.loadChatPage()})}loadChatPage(){if(!this.currentSession){this.loadKeyExchangePage();return}const t=document.getElementById("root");t.innerHTML=`
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
        `,k(this.currentSession),$(this.currentSession)}loadAboutPage(){const t=document.getElementById("root");t.innerHTML=`
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
        `}}document.addEventListener("DOMContentLoaded",()=>{new B});
