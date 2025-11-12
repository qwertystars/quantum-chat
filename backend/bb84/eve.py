"""
Eve module for BB84 protocol - the eavesdropper.
"""
import numpy as np
from typing import List
from .qubit import Qubit, Basis, Bit


class Eve:
    """Eve (eavesdropper) in the BB84 quantum key distribution protocol."""

    def __init__(self, intercept_probability: float = 1.0):
        """
        Initialize Eve with interception probability.

        Args:
            intercept_probability: Probability that Eve intercepts each qubit (0.0 to 1.0)
        """
        self.intercept_probability = intercept_probability
        self.bases: List[Basis] = []
        self.measurement_results: List[Bit] = []
        self.intercepted_indices: List[int] = []

    def intercept_qubits(self, qubits: List[Qubit]) -> List[Qubit]:
        """
        Intercept and measure qubits, then re-prepare them for Bob.
        This introduces errors when Eve uses the wrong basis.

        Args:
            qubits: List of qubits being transmitted

        Returns:
            List of qubits (potentially modified by Eve's measurement)
        """
        modified_qubits = []
        basis_choices = ['rectilinear', 'diagonal']

        for i, qubit in enumerate(qubits):
            # Decide whether to intercept this qubit
            if np.random.random() < self.intercept_probability:
                # Eve intercepts: measure with random basis
                eve_basis = basis_choices[np.random.randint(0, 2)]
                self.bases.append(eve_basis)
                self.intercepted_indices.append(i)

                # Measure the qubit
                measured_bit = qubit.measure(eve_basis)
                self.measurement_results.append(measured_bit)

                # Re-prepare qubit for Bob (introduces error if wrong basis)
                new_qubit = Qubit(measured_bit, eve_basis)
                modified_qubits.append(new_qubit)
            else:
                # Eve doesn't intercept - pass through unchanged
                modified_qubits.append(qubit)

        return modified_qubits

    def get_state(self) -> dict:
        """Get Eve's current state for debugging/visualization."""
        return {
            'intercept_probability': self.intercept_probability,
            'n_intercepted': len(self.intercepted_indices),
            'intercepted_indices': self.intercepted_indices[:10],  # First 10
            'bases': self.bases[:10],
            'measurements': self.measurement_results[:10]
        }
