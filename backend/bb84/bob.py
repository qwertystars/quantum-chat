"""
Bob module for BB84 protocol - the receiver.
"""
import numpy as np
from typing import List, Tuple
from .qubit import Qubit, Basis, Bit


class Bob:
    """Bob (receiver) in the BB84 quantum key distribution protocol."""

    def __init__(self, key_length: int = 256):
        """
        Initialize Bob with desired key length.

        Args:
            key_length: Desired length of the final shared key in bits
        """
        self.key_length = key_length
        self.bases: List[Basis] = []
        self.measurement_results: List[Bit] = []
        self.sifted_key: List[Bit] = []
        self.final_key: str = ""

    def generate_random_bases(self, n_qubits: int) -> List[Basis]:
        """
        Generate random measurement bases.

        Args:
            n_qubits: Number of bases to generate

        Returns:
            List of random bases
        """
        basis_choices = ['rectilinear', 'diagonal']
        self.bases = [basis_choices[i] for i in np.random.randint(0, 2, n_qubits)]
        return self.bases

    def measure_qubits(self, qubits: List[Qubit]) -> List[Bit]:
        """
        Measure received qubits in randomly chosen bases.

        Args:
            qubits: List of qubits to measure

        Returns:
            List of measurement results
        """
        if not self.bases:
            self.generate_random_bases(len(qubits))

        self.measurement_results = [
            qubit.measure(basis)
            for qubit, basis in zip(qubits, self.bases)
        ]
        return self.measurement_results

    def sift_key(self, alice_bases: List[Basis]) -> List[Bit]:
        """
        Perform key sifting by keeping only bits where bases match.

        Args:
            alice_bases: Alice's preparation bases

        Returns:
            Sifted key bits
        """
        self.sifted_key = [
            self.measurement_results[i]
            for i in range(len(self.measurement_results))
            if self.bases[i] == alice_bases[i]
        ]
        return self.sifted_key

    def sample_for_error_check(self, sample_size: int) -> Tuple[List[int], List[Bit]]:
        """
        Sample bits for error rate estimation.

        Args:
            sample_size: Number of bits to sample

        Returns:
            Tuple of (sample_indices, sample_bits)
        """
        n_bits = len(self.sifted_key)
        sample_size = min(sample_size, n_bits // 2)  # Don't use more than half

        sample_indices = sorted(np.random.choice(n_bits, sample_size, replace=False))
        sample_bits = [self.sifted_key[i] for i in sample_indices]

        return sample_indices, sample_bits

    def error_correction(self, sample_indices: List[int]) -> List[Bit]:
        """
        Remove sampled bits from key.

        Args:
            sample_indices: Indices of bits to remove

        Returns:
            Remaining key bits
        """
        remaining_key = [
            bit for i, bit in enumerate(self.sifted_key)
            if i not in sample_indices
        ]
        return remaining_key

    def privacy_amplification(self, key_bits: List[Bit]) -> str:
        """
        Perform privacy amplification to generate final key.

        Args:
            key_bits: Key bits after error correction

        Returns:
            Final key as hexadecimal string
        """
        # Take only the desired key length
        final_bits = key_bits[:self.key_length]

        # Pad if necessary
        if len(final_bits) < self.key_length:
            final_bits.extend([0] * (self.key_length - len(final_bits)))

        # Convert bits to hex string
        self.final_key = ''.join(
            format(int(''.join(map(str, final_bits[i:i+8])), 2), '02x')
            for i in range(0, len(final_bits), 8)
        )

        return self.final_key

    def get_state(self) -> dict:
        """Get Bob's current state for debugging/visualization."""
        return {
            'n_measurements': len(self.measurement_results),
            'bases': self.bases[:10],  # First 10 for preview
            'measurements': self.measurement_results[:10],
            'sifted_key_length': len(self.sifted_key),
            'final_key_length': len(self.final_key) * 4,  # hex to bits
            'final_key': self.final_key[:16] + '...' if len(self.final_key) > 16 else self.final_key
        }
