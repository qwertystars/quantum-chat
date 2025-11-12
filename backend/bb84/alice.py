"""
Alice module for BB84 protocol - the sender.
"""
import numpy as np
from typing import List, Tuple
from .qubit import Qubit, Basis, Bit


class Alice:
    """Alice (sender) in the BB84 quantum key distribution protocol."""

    def __init__(self, key_length: int = 256):
        """
        Initialize Alice with desired key length.

        Args:
            key_length: Desired length of the final shared key in bits
        """
        self.key_length = key_length
        # Generate more bits than needed for sifting and error correction
        self.n_qubits = key_length * 4
        self.bits: List[Bit] = []
        self.bases: List[Basis] = []
        self.qubits: List[Qubit] = []
        self.sifted_key: List[Bit] = []
        self.final_key: str = ""

    def generate_random_bits(self) -> List[Bit]:
        """Generate random bits to encode in qubits."""
        self.bits = [int(bit) for bit in np.random.randint(0, 2, self.n_qubits)]
        return self.bits

    def generate_random_bases(self) -> List[Basis]:
        """Generate random measurement bases."""
        basis_choices = ['rectilinear', 'diagonal']
        self.bases = [basis_choices[i] for i in np.random.randint(0, 2, self.n_qubits)]
        return self.bases

    def prepare_qubits(self) -> List[Qubit]:
        """
        Prepare qubits by encoding bits in randomly chosen bases.

        Returns:
            List of prepared qubits
        """
        if not self.bits:
            self.generate_random_bits()
        if not self.bases:
            self.generate_random_bases()

        self.qubits = [Qubit(bit, basis) for bit, basis in zip(self.bits, self.bases)]
        return self.qubits

    def sift_key(self, bob_bases: List[Basis]) -> List[Bit]:
        """
        Perform key sifting by keeping only bits where bases match.

        Args:
            bob_bases: Bob's measurement bases

        Returns:
            Sifted key bits
        """
        self.sifted_key = [
            self.bits[i]
            for i in range(len(self.bits))
            if self.bases[i] == bob_bases[i]
        ]
        return self.sifted_key

    def error_correction(self, sample_indices: List[int], bob_sample: List[Bit]) -> Tuple[float, List[Bit]]:
        """
        Perform error correction by comparing sample bits.

        Args:
            sample_indices: Indices of bits to sample for error estimation
            bob_sample: Bob's sampled bits

        Returns:
            Tuple of (error_rate, remaining_key)
        """
        # Calculate error rate from sample
        errors = sum(
            1 for i, idx in enumerate(sample_indices)
            if self.sifted_key[idx] != bob_sample[i]
        )
        error_rate = errors / len(sample_indices) if sample_indices else 0.0

        # Remove sampled bits from key
        remaining_key = [
            bit for i, bit in enumerate(self.sifted_key)
            if i not in sample_indices
        ]

        return error_rate, remaining_key

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
        """Get Alice's current state for debugging/visualization."""
        return {
            'n_qubits': self.n_qubits,
            'bits': self.bits[:10],  # First 10 for preview
            'bases': self.bases[:10],
            'sifted_key_length': len(self.sifted_key),
            'final_key_length': len(self.final_key) * 4,  # hex to bits
            'final_key': self.final_key[:16] + '...' if len(self.final_key) > 16 else self.final_key
        }
