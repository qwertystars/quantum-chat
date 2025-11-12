/**
 * Visualization Component for BB84 Protocol
 */

export function initVisualization(sessionData) {
    const container = document.getElementById('visualization');

    const bb84Result = sessionData.bb84_result;

    container.innerHTML = `
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
                    ${bb84Result.eavesdropping_enabled ? `
                        <div class="flow-step ${bb84Result.error_detected ? 'detected' : ''}">
                            <div class="step-icon">🕵️</div>
                            <div class="step-label">Eve</div>
                            <div class="step-desc">${bb84Result.error_detected ? 'Detected!' : 'Intercepting'}</div>
                        </div>
                        <div class="flow-arrow">→</div>
                    ` : ''}
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
                            class="meter-fill ${bb84Result.qber > bb84Result.qber_threshold ? 'danger' : 'safe'}"
                            style="width: ${Math.min((bb84Result.qber / bb84Result.qber_threshold) * 100, 100)}%"
                        ></div>
                        <div class="meter-threshold" style="left: 100%"></div>
                    </div>
                    <div class="meter-labels">
                        <span>0%</span>
                        <span class="threshold-label">Threshold: ${(bb84Result.qber_threshold * 100).toFixed(0)}%</span>
                        <span>Current: ${(bb84Result.qber * 100).toFixed(2)}%</span>
                    </div>
                </div>
                <div class="qber-status ${bb84Result.qber > bb84Result.qber_threshold ? 'danger' : 'safe'}">
                    ${bb84Result.qber > bb84Result.qber_threshold
                        ? '⚠️ High error rate detected - Possible eavesdropping!'
                        : '✓ Error rate within acceptable range - Communication secure'
                    }
                </div>
            </div>

            <div class="viz-section">
                <h4>Key Generation Statistics</h4>
                <div class="stats-bars">
                    <div class="stat-bar-item">
                        <label>Initial Qubits</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 100%">
                                ${bb84Result.alice_state.n_qubits}
                            </div>
                        </div>
                    </div>
                    <div class="stat-bar-item">
                        <label>After Sifting</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${(bb84Result.alice_state.sifted_key_length / bb84Result.alice_state.n_qubits) * 100}%">
                                ${bb84Result.alice_state.sifted_key_length}
                            </div>
                        </div>
                    </div>
                    <div class="stat-bar-item">
                        <label>Final Key</label>
                        <div class="stat-bar">
                            <div class="stat-bar-fill success" style="width: ${(bb84Result.alice_state.final_key_length / bb84Result.alice_state.n_qubits) * 100}%">
                                ${bb84Result.alice_state.final_key_length} bits
                            </div>
                        </div>
                    </div>
                </div>
                <div class="efficiency-metric">
                    <strong>Overall Efficiency:</strong>
                    ${((bb84Result.alice_state.final_key_length / bb84Result.alice_state.n_qubits) * 100).toFixed(1)}%
                </div>
            </div>

            <div class="viz-section">
                <h4>Security Status</h4>
                <div class="security-indicators">
                    <div class="indicator ${bb84Result.key_established ? 'success' : 'error'}">
                        <span class="indicator-icon">${bb84Result.key_established ? '✓' : '✗'}</span>
                        <span class="indicator-label">Key Established</span>
                    </div>
                    <div class="indicator ${!bb84Result.error_detected ? 'success' : 'error'}">
                        <span class="indicator-icon">${!bb84Result.error_detected ? '✓' : '⚠️'}</span>
                        <span class="indicator-label">No Intrusion Detected</span>
                    </div>
                    <div class="indicator success">
                        <span class="indicator-icon">🔒</span>
                        <span class="indicator-label">AES Encryption Active</span>
                    </div>
                </div>
            </div>

            ${bb84Result.eavesdropping_enabled && bb84Result.eve_state ? `
                <div class="viz-section eve-info">
                    <h4>Eavesdropper Activity</h4>
                    <div class="eve-stats">
                        <div class="eve-stat">
                            <label>Qubits Intercepted:</label>
                            <span>${bb84Result.eve_state.n_intercepted}</span>
                        </div>
                        <div class="eve-stat">
                            <label>Interception Rate:</label>
                            <span>${(bb84Result.eve_state.intercept_probability * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}
