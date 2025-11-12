"""
BB84 protocol coordinator - orchestrates the quantum key distribution.
"""
from typing import Optional, Dict, Any
from .alice import Alice
from .bob import Bob
from .eve import Eve
from .qubit import Bit


class BB84Protocol:
    """Coordinates the BB84 quantum key distribution protocol."""

    def __init__(
        self,
        key_length: int = 256,
        enable_eve: bool = False,
        eve_intercept_prob: float = 1.0,
        qber_threshold: float = 0.11
    ):
        """
        Initialize the BB84 protocol.

        Args:
            key_length: Desired length of final key in bits
            enable_eve: Whether to enable eavesdropping
            eve_intercept_prob: Probability that Eve intercepts each qubit
            qber_threshold: Maximum acceptable QBER (typically ~11% for BB84)
        """
        self.key_length = key_length
        self.enable_eve = enable_eve
        self.eve_intercept_prob = eve_intercept_prob
        self.qber_threshold = qber_threshold

        self.alice = Alice(key_length)
        self.bob = Bob(key_length)
        self.eve = None
        if enable_eve:
            self.eve = Eve(eve_intercept_prob)

        self.qber: Optional[float] = None
        self.key_established: bool = False
        self.error_detected: bool = False

    def run(self) -> Dict[str, Any]:
        """
        Execute the complete BB84 protocol.

        Returns:
            Dictionary with protocol results and statistics
        """
        # Step 1: Alice prepares qubits
        alice_qubits = self.alice.prepare_qubits()

        # Step 2: Quantum channel transmission (with optional eavesdropping)
        if self.enable_eve and self.eve:
            transmitted_qubits = self.eve.intercept_qubits(alice_qubits)
        else:
            transmitted_qubits = alice_qubits

        # Step 3: Bob measures qubits
        self.bob.measure_qubits(transmitted_qubits)

        # Step 4: Classical channel - basis comparison and sifting
        alice_sifted = self.alice.sift_key(self.bob.bases)
        bob_sifted = self.bob.sift_key(self.alice.bases)

        # Step 5: Error estimation
        sample_size = min(50, len(bob_sifted) // 4)  # Sample ~25%
        sample_indices, bob_sample = self.bob.sample_for_error_check(sample_size)

        alice_sample = [self.alice.sifted_key[i] for i in sample_indices]
        errors = sum(1 for a, b in zip(alice_sample, bob_sample) if a != b)
        self.qber = errors / len(alice_sample) if alice_sample else 0.0

        # Step 6: Check if QBER is acceptable
        if self.qber > self.qber_threshold:
            self.error_detected = True
            self.key_established = False
            return self._get_results(success=False, reason="QBER too high - possible eavesdropping")

        # Step 7: Error correction and privacy amplification
        _, alice_remaining = self.alice.error_correction(sample_indices, bob_sample)
        bob_remaining = self.bob.error_correction(sample_indices)

        alice_final_key = self.alice.privacy_amplification(alice_remaining)
        bob_final_key = self.bob.privacy_amplification(bob_remaining)

        # Step 8: Verify keys match
        if alice_final_key == bob_final_key:
            self.key_established = True
            return self._get_results(success=True, final_key=alice_final_key)
        else:
            self.key_established = False
            return self._get_results(success=False, reason="Key mismatch after protocol")

    def _get_results(self, success: bool, final_key: str = "", reason: str = "") -> Dict[str, Any]:
        """
        Compile protocol results.

        Args:
            success: Whether key was successfully established
            final_key: The final shared key (if successful)
            reason: Reason for failure (if unsuccessful)

        Returns:
            Dictionary with complete protocol results
        """
        results = {
            'success': success,
            'key_established': self.key_established,
            'final_key': final_key,
            'key_length': len(final_key) * 4 if final_key else 0,  # hex to bits
            'qber': self.qber,
            'qber_threshold': self.qber_threshold,
            'error_detected': self.error_detected,
            'eavesdropping_enabled': self.enable_eve,
            'alice_state': self.alice.get_state(),
            'bob_state': self.bob.get_state(),
        }

        if self.enable_eve and self.eve:
            results['eve_state'] = self.eve.get_state()

        if not success:
            results['failure_reason'] = reason

        return results

    def calculate_qber(self, alice_bits: list[Bit], bob_bits: list[Bit]) -> float:
        """
        Calculate Quantum Bit Error Rate.

        Args:
            alice_bits: Alice's bits
            bob_bits: Bob's bits

        Returns:
            QBER as a fraction
        """
        if not alice_bits or not bob_bits or len(alice_bits) != len(bob_bits):
            return 0.0

        errors = sum(1 for a, b in zip(alice_bits, bob_bits) if a != b)
        return errors / len(alice_bits)
