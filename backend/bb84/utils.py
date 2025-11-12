"""
Utility functions for BB84 protocol.
"""
from typing import List, Literal

Bit = Literal[0, 1]


def bits_to_hex_key(key_bits: List[Bit], key_length: int) -> str:
    """
    Convert a list of bits to a hexadecimal key string.

    Args:
        key_bits: List of bits (0 or 1)
        key_length: Required key length in bits

    Returns:
        Hexadecimal string representation of the key

    Raises:
        ValueError: If insufficient bits are available (no padding performed)
    """
    if len(key_bits) < key_length:
        raise ValueError(
            f"Insufficient bits for key generation: have {len(key_bits)}, need {key_length}. "
            f"This typically indicates too many bits were discarded during error correction. "
            f"Try generating more initial qubits or reducing the error correction sample size."
        )

    # Take only the required number of bits
    final_bits = key_bits[:key_length]

    # Convert bits to hex string
    hex_key = ''.join(
        format(int(''.join(map(str, final_bits[i:i+8])), 2), '02x')
        for i in range(0, len(final_bits), 8)
    )

    return hex_key
