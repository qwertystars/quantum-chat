/**
 * Key Exchange Component
 */

import { apiClient } from '../api/client.js';

export function initKeyExchange(onSuccess) {
    const container = document.getElementById('key-exchange-container');

    container.innerHTML = `
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
    `;

    // Event listeners
    const enableEveCheckbox = document.getElementById('enable-eve');
    const eveConfig = container.querySelector('.eve-config');
    const eveInterceptProb = document.getElementById('eve-intercept-prob');
    const eveProbValue = document.getElementById('eve-prob-value');
    const qberThreshold = document.getElementById('qber-threshold');
    const qberThresholdValue = document.getElementById('qber-threshold-value');
    const startButton = document.getElementById('start-protocol');

    enableEveCheckbox.addEventListener('change', (e) => {
        eveConfig.style.display = e.target.checked ? 'block' : 'none';
    });

    eveInterceptProb.addEventListener('input', (e) => {
        eveProbValue.textContent = `${(e.target.value * 100).toFixed(0)}%`;
    });

    qberThreshold.addEventListener('input', (e) => {
        qberThresholdValue.textContent = `${(e.target.value * 100).toFixed(0)}%`;
    });

    startButton.addEventListener('click', async () => {
        const config = {
            key_length: parseInt(document.getElementById('key-length').value),
            enable_eve: enableEveCheckbox.checked,
            eve_intercept_prob: parseFloat(eveInterceptProb.value),
            qber_threshold: parseFloat(qberThreshold.value)
        };

        const statusDiv = document.getElementById('protocol-status');
        const resultDiv = document.getElementById('protocol-result');

        statusDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        startButton.disabled = true;

        try {
            const response = await apiClient.keyExchange(config);
            displayResult(response, resultDiv, onSuccess);
        } catch (error) {
            displayError(error.message, resultDiv);
        } finally {
            statusDiv.style.display = 'none';
            startButton.disabled = false;
        }
    });
}

function displayResult(response, container, onSuccess) {
    const result = response.bb84_result;

    container.innerHTML = `
        <div class="result-card ${result.success ? 'success' : 'error'}">
            <div class="result-header">
                <h3>${result.success ? '✓ Key Exchange Successful!' : '✗ Key Exchange Failed'}</h3>
            </div>

            <div class="result-body">
                ${result.success ? `
                    <div class="result-item">
                        <label>Session ID:</label>
                        <code>${response.session_id}</code>
                    </div>
                    <div class="result-item">
                        <label>Quantum Key:</label>
                        <code class="quantum-key">${response.quantum_key.substring(0, 32)}...</code>
                    </div>
                    <div class="result-item">
                        <label>Key Length:</label>
                        <span>${result.key_length} bits</span>
                    </div>
                ` : `
                    <div class="error-message">
                        <p><strong>Failure Reason:</strong> ${result.failure_reason}</p>
                    </div>
                `}

                <div class="result-item">
                    <label>QBER (Quantum Bit Error Rate):</label>
                    <span class="${result.qber > result.qber_threshold ? 'error-text' : 'success-text'}">
                        ${(result.qber * 100).toFixed(2)}%
                    </span>
                    ${result.qber > result.qber_threshold ? ' ⚠️ Above threshold!' : ' ✓ Within acceptable range'}
                </div>

                ${result.eavesdropping_enabled ? `
                    <div class="result-item">
                        <label>Eavesdropper Detected:</label>
                        <span class="${result.error_detected ? 'error-text' : 'success-text'}">
                            ${result.error_detected ? 'Yes - High QBER detected!' : 'No - Communication secure'}
                        </span>
                    </div>
                ` : ''}

                <div class="result-stats">
                    <h4>Protocol Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <label>Initial Qubits:</label>
                            <span>${result.alice_state.n_qubits}</span>
                        </div>
                        <div class="stat">
                            <label>Sifted Key Length:</label>
                            <span>${result.alice_state.sifted_key_length} bits</span>
                        </div>
                        <div class="stat">
                            <label>Final Key Length:</label>
                            <span>${result.alice_state.final_key_length} bits</span>
                        </div>
                        <div class="stat">
                            <label>Efficiency:</label>
                            <span>${((result.alice_state.final_key_length / result.alice_state.n_qubits) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                ${result.success ? `
                    <button class="btn btn-primary btn-large" id="go-to-chat">
                        💬 Start Secure Chat
                    </button>
                ` : `
                    <button class="btn btn-secondary" id="retry-protocol">
                        🔄 Try Again
                    </button>
                `}
            </div>
        </div>
    `;

    container.style.display = 'block';

    if (result.success) {
        document.getElementById('go-to-chat').addEventListener('click', () => {
            onSuccess(response);
        });
    } else {
        document.getElementById('retry-protocol').addEventListener('click', () => {
            container.style.display = 'none';
            document.getElementById('start-protocol').disabled = false;
        });
    }
}

function displayError(message, container) {
    container.innerHTML = `
        <div class="result-card error">
            <div class="result-header">
                <h3>✗ Error</h3>
            </div>
            <div class="result-body">
                <p class="error-message">${message}</p>
                <button class="btn btn-secondary" id="retry-protocol">
                    🔄 Try Again
                </button>
            </div>
        </div>
    `;

    container.style.display = 'block';

    document.getElementById('retry-protocol').addEventListener('click', () => {
        container.style.display = 'none';
        document.getElementById('start-protocol').disabled = false;
    });
}
