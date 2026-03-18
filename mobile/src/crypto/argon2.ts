import * as Crypto from 'expo-crypto';
import { encode as base64Encode, decode as base64Decode } from 'base-64';
import CryptoJS from 'crypto-js';

// Argon2id parameters — tuned for mobile stability
export const ARGON2_PARAMS = {
  memory: 32768,       // 32MB
  iterations: 3,       // 3 passes
  parallelism: 1,      // 1 thread
  hashLength: 32,      // 256-bit output key
  type: 2,             // Argon2id
} as const;

import argon2 from 'argon2-wasm-pro';

export interface DerivedKey {
  key: Uint8Array;       // 256-bit derived key
  salt: string;          // hex-encoded salt
  params: {
    memory: number;      // 0 = PBKDF2 Fallback
    iterations: number;  // PBKDF2 rounds or Argon2 passes
    parallelism: number;
    hashLength: number;
    type: number;
  };
}

/**
 * Derives a 256-bit vault key.
 * Attempts Argon2id (best), falls back to PBKDF2-SHA256 (Expo Go compatible).
 */
export async function deriveVaultKey(
  masterPassword: string,
  salt: string | null = null
): Promise<DerivedKey> {
  const saltHex = salt ?? await generateSalt();
  const saltBytes = hexToBytes(saltHex);

  try {
    console.log(`[KDF] Attempting Argon2id...`);
    const result = await argon2.hash({
      pass: masterPassword,
      salt: saltBytes,
      time: ARGON2_PARAMS.iterations,
      mem: ARGON2_PARAMS.memory,
      parallelism: ARGON2_PARAMS.parallelism,
      hashLen: ARGON2_PARAMS.hashLength,
      type: ARGON2_PARAMS.type,
    });

    console.log(`[KDF] Argon2id success.`);
    return {
      key: result.hash,
      salt: saltHex,
      params: ARGON2_PARAMS,
    };
  } catch (err: any) {
    console.warn(`[KDF] Argon2 failed/unsupported: ${err.message}. Falling back to PBKDF2...`);
    
    // PBKDF2 Fallback (Pure JS, safe for Expo Go/Hermes)
    // 100k iterations is standard for PBKDF2-HMAC-SHA256
    const rounds = 100000; 
    const key = CryptoJS.PBKDF2(masterPassword, saltHex, {
      keySize: 256 / 32,
      iterations: rounds,
      hasher: CryptoJS.algo.SHA256
    });

    // Convert WordArray to Uint8Array
    const keyBytes = new Uint8Array(key.sigBytes);
    const words = key.words;
    for (let i = 0; i < key.sigBytes; i++) {
      keyBytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return {
      key: keyBytes,
      salt: saltHex,
      params: { 
        ...ARGON2_PARAMS, 
        memory: 0, // Signal PBKDF2 Mode
        iterations: rounds 
      },
    };
  }
}

/**
 * Derives a key from the recovery phrase.
 * Same fallback logic as master password.
 */
export async function deriveRecoveryKey(
  recoveryPhrase: string,
  salt: string | null = null
): Promise<DerivedKey> {
  const saltHex = salt ?? await generateSalt();
  const saltBytes = hexToBytes(saltHex);

  const cleanPhrase = recoveryPhrase.trim().toLowerCase();

  try {
    const result = await argon2.hash({
      pass: cleanPhrase,
      salt: saltBytes,
      time: 2,
      mem: 32768,
      parallelism: 1,
      hashLen: 32,
      type: 2,
    });
    return {
      key: result.hash,
      salt: saltHex,
      params: { ...ARGON2_PARAMS, iterations: 2 },
    };
  } catch {
    console.warn(`[KDF] Recovery Argon2 fallback to PBKDF2...`);
    const rounds = 50000;
    const key = CryptoJS.PBKDF2(cleanPhrase, saltHex, {
      keySize: 256 / 32,
      iterations: rounds,
      hasher: CryptoJS.algo.SHA256
    });

    const keyBytes = new Uint8Array(key.sigBytes);
    const words = key.words;
    for (let i = 0; i < key.sigBytes; i++) {
        keyBytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return {
      key: keyBytes,
      salt: saltHex,
      params: { ...ARGON2_PARAMS, memory: 0, iterations: rounds },
    };
  }
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