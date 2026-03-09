import * as Crypto from 'expo-crypto';
import { encode as base64Encode, decode as base64Decode } from 'base-64';

// Argon2id parameters — tuned for mobile (balance of security and speed)
// These must match what the backend stores in vault_configs
export const ARGON2_PARAMS = {
  memory: 65536,       // 64MB — enough to resist GPU attacks
  iterations: 3,       // 3 passes
  parallelism: 4,       // 4 threads
  hashLength: 32,      // 256-bit output key
  type: 2,             // Argon2id (hybrid of Argon2i and Argon2d)
} as const;

// React Native doesn't have a native Argon2 binding in expo-crypto yet.
// Use the argon2-wasm-pro package (WebAssembly, works in RN with Hermes).
// Install: npm install argon2-wasm-pro
import argon2 from 'argon2-wasm-pro';

export interface DerivedKey {
  key: Uint8Array;       // 32-byte derived key
  salt: string;          // hex-encoded salt (stored, not secret)
  params: typeof ARGON2_PARAMS;
}

/**
 * Derives a 256-bit vault key from the master password using Argon2id.
 * This is the ONLY way the vault key is ever produced from a password.
 *
 * @param masterPassword - The user's master password (never stored)
 * @param salt           - Hex-encoded salt. Pass null to generate a new one.
 * @returns              - Derived key + salt (salt must be stored in vault config)
 */
export async function deriveVaultKey(
  masterPassword: string,
  salt: string | null = null
): Promise<DerivedKey> {
  // Generate a fresh salt if not provided (first-time setup)
  const saltHex = salt ?? await generateSalt();
  const saltBytes = hexToBytes(saltHex);

  const result = await argon2.hash({
    pass: masterPassword,
    salt: saltBytes,
    time: ARGON2_PARAMS.iterations,
    mem: ARGON2_PARAMS.memory,
    parallelism: ARGON2_PARAMS.parallelism,
    hashLen: ARGON2_PARAMS.hashLength,
    type: ARGON2_PARAMS.type,
  });

  return {
    key: result.hash,
    salt: saltHex,
    params: ARGON2_PARAMS,
  };
}

/**
 * Derives a key from the recovery phrase (16 words).
 * Uses different salt than the master password — stored separately.
 */
export async function deriveRecoveryKey(
  recoveryPhrase: string,
  salt: string | null = null
): Promise<DerivedKey> {
  // Recovery phrase derivation uses slightly weaker params (faster)
  // since the phrase itself has high entropy (128 bits from 16 words)
  const saltHex = salt ?? await generateSalt();
  const saltBytes = hexToBytes(saltHex);

  const result = await argon2.hash({
    pass: recoveryPhrase.trim().toLowerCase(),
    salt: saltBytes,
    time: 2,
    mem: 32768,   // 32MB for recovery (faster UX on recovery flow)
    parallelism: 2,
    hashLen: 32,
    type: 2,
  });

  return {
    key: result.hash,
    salt: saltHex,
    params: { ...ARGON2_PARAMS, memory: 32768, iterations: 2, parallelism: 2 },
  };
}

async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return bytesToHex(bytes);
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}