"""
BB84 protocol - Simplified implementation based on GitHub BB84 repo
From: https://github.com/qwertystars/BB84
"""
import numpy as np
from typing import Dict, Any
from .utils import (
    generate_random_bits,
    generate_random_bases,
    apply_channel_error,
    sift_key,
    calculate_qber,
    bits_to_hex_key
)


class BB84Protocol:
    """Simplified BB84 protocol for quantum key distribution."""

    def __init__(
        self,
        key_length: int = 256,
        enable_eve: bool = False,
        eve_intercept_prob: float = 0.5,
        qber_threshold: float = 0.11
    ):
        """
        Initialize the BB84 protocol.

        Args:
            key_length: Desired length of final key in bits
            enable_eve: Whether to enable eavesdropping simulation
            eve_intercept_prob: Fraction of qubits Eve intercepts (0.0-1.0)
            qber_threshold: Maximum acceptable QBER (typically ~11% for BB84)
        """
        self.key_length = key_length
        self.enable_eve = enable_eve
        self.eve_intercept_prob = eve_intercept_prob
        self.qber_threshold = qber_threshold

        # Calculate how many qubits we need to generate the desired key length
        # We need about 4x because:
        # - 50% are discarded during basis sifting (bases don't match)
        # - We need overhead for error correction and privacy amplification
        self.qubit_count = max(key_length * 4, 1000)

    def run(self) -> Dict[str, Any]:
        """
        Execute the complete BB84 protocol.

        Returns:
            Dictionary with protocol results and statistics
        """
        # Step 1: Alice generates random bits and encodes them in random bases
        alice_bits = generate_random_bits(self.qubit_count)
        alice_bases = generate_random_bases(self.qubit_count)

        # Step 2: Bob generates random measurement bases
        bob_bases = generate_random_bases(self.qubit_count)

        # Step 3: Simulate quantum channel transmission
        transmitted_bits = alice_bits.copy()

        # Step 3a: Eve's intercept-resend attack (if enabled)
        if self.enable_eve:
            eve_bases = generate_random_bases(self.qubit_count)
            eve_intercepts = np.random.random(self.qubit_count) < self.eve_intercept_prob

            for i in range(self.qubit_count):
                if eve_intercepts[i]:
                    # Eve measures in her random basis
                    if alice_bases[i] != eve_bases[i]:
                        # Wrong basis measurement causes 50% probability of error
                        if np.random.random() < 0.5:
                            transmitted_bits[i] = 1 - alice_bits[i]

        # Step 3b: Channel noise (small error rate to be realistic)
        channel_error_rate = 0.01  # 1% channel noise
        transmitted_bits = apply_channel_error(transmitted_bits, channel_error_rate)

        # Step 4: Bob measures the qubits
        bob_bits = transmitted_bits.copy()

        # Step 5: Basis sifting - Alice and Bob publicly compare bases
        sifted_key_str, matching_bases = sift_key(
            alice_bits, bob_bits, alice_bases, bob_bases
        )

        # Step 6: Calculate QBER from matching bases
        qber = calculate_qber(alice_bits, bob_bits, matching_bases)

        # Step 7: Check if QBER is acceptable
        if qber > self.qber_threshold:
            return {
                'success': False,
                'key_established': False,
                'final_key': '',
                'key_length': 0,
                'qber': qber,
                'qber_threshold': self.qber_threshold,
                'error_detected': True,
                'eavesdropping_enabled': self.enable_eve,
                'failure_reason': f'QBER ({qber:.2%}) exceeds threshold ({self.qber_threshold:.2%}) - possible eavesdropping detected',
                'alice_state': {
                    'total_qubits': self.qubit_count,
                    'sifted_bits': int(np.sum(matching_bases))
                },
                'bob_state': {
                    'total_qubits': self.qubit_count,
                    'sifted_bits': int(np.sum(matching_bases))
                }
            }

        # Step 8: Convert sifted bits to final key
        sifted_bits_array = [int(b) for b in sifted_key_str]

        if len(sifted_bits_array) < self.key_length:
            return {
                'success': False,
                'key_established': False,
                'final_key': '',
                'key_length': 0,
                'qber': qber,
                'qber_threshold': self.qber_threshold,
                'error_detected': False,
                'eavesdropping_enabled': self.enable_eve,
                'failure_reason': f'Insufficient sifted bits: have {len(sifted_bits_array)}, need {self.key_length}',
                'alice_state': {
                    'total_qubits': self.qubit_count,
                    'sifted_bits': len(sifted_bits_array)
                },
                'bob_state': {
                    'total_qubits': self.qubit_count,
                    'sifted_bits': len(sifted_bits_array)
                }
            }

        # Convert bits to hex key
        final_key = bits_to_hex_key(sifted_bits_array, self.key_length)

        # Success!
        return {
            'success': True,
            'key_established': True,
            'final_key': final_key,
            'key_length': self.key_length,
            'qber': qber,
            'qber_threshold': self.qber_threshold,
            'error_detected': False,
            'eavesdropping_enabled': self.enable_eve,
            'alice_state': {
                'total_qubits': self.qubit_count,
                'sifted_bits': len(sifted_bits_array),
                'final_key_length': self.key_length
            },
            'bob_state': {
                'total_qubits': self.qubit_count,
                'sifted_bits': len(sifted_bits_array),
                'final_key_length': self.key_length
            }
        }

    def calculate_qber(self, alice_bits, bob_bits):
        """
        Calculate Quantum Bit Error Rate.

        Args:
            alice_bits: Alice's bits
            bob_bits: Bob's bits

        Returns:
            QBER as a fraction
        """
        return calculate_qber(alice_bits, bob_bits, alice_bits == alice_bits)
