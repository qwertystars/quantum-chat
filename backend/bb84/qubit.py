"""
Qubit representation and quantum states for BB84 protocol.
"""
import numpy as np
from typing import Literal

# Quantum states in computational basis
STATE_0 = np.array([1, 0])  # |0⟩
STATE_1 = np.array([0, 1])  # |1⟩

# Quantum states in Hadamard basis
STATE_PLUS = np.array([1/np.sqrt(2), 1/np.sqrt(2)])   # |+⟩ = (|0⟩ + |1⟩)/√2
STATE_MINUS = np.array([1/np.sqrt(2), -1/np.sqrt(2)])  # |-⟩ = (|0⟩ - |1⟩)/√2

Basis = Literal['rectilinear', 'diagonal']
Bit = Literal[0, 1]


class Qubit:
    """Represents a quantum bit (qubit) in the BB84 protocol."""

    def __init__(self, bit: Bit, basis: Basis):
        """
        Initialize a qubit with a classical bit value and measurement basis.

        Args:
            bit: Classical bit value (0 or 1)
            basis: Measurement basis ('rectilinear' or 'diagonal')
        """
        self.bit = bit
        self.basis = basis
        self.state = self._prepare_state()

    def _prepare_state(self) -> np.ndarray:
        """Prepare the quantum state based on bit value and basis."""
        if self.basis == 'rectilinear':
            return STATE_0 if self.bit == 0 else STATE_1
        else:  # diagonal
            return STATE_PLUS if self.bit == 0 else STATE_MINUS

    def measure(self, measurement_basis: Basis) -> Bit:
        """
        Measure the qubit in a given basis.

        Args:
            measurement_basis: Basis to measure in ('rectilinear' or 'diagonal')

        Returns:
            Measured bit value (0 or 1)
        """
        if measurement_basis == self.basis:
            # Same basis - deterministic result
            return self.bit
        else:
            # Different basis - random result (50/50)
            return np.random.choice([0, 1])

    def __repr__(self) -> str:
        return f"Qubit(bit={self.bit}, basis={self.basis})"
