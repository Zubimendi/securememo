import * as Crypto from 'expo-crypto';
import { bytesToHex, hexToBytes } from './argon2';

// AES-256-GCM provides both confidentiality AND integrity.
// If anyone tampers with the ciphertext, decryption fails — you know immediately.
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;    // bits
const IV_LENGTH = 12;      // bytes — 96-bit IV is the GCM standard
const TAG_LENGTH = 128;    // bits — authentication tag length

/**
 * Encrypts plaintext with AES-256-GCM.
 *
 * Output format: base64(iv [12 bytes] + ciphertext + auth_tag [16 bytes])
 * The IV is prepended so the same function can both encrypt and decrypt.
 * A fresh IV is generated for EVERY encryption — never reuse an IV with the same key.
 */
export async function encrypt(plaintext: string, keyBytes: Uint8Array): Promise<string> {
  const key = await importKey(keyBytes);

  // Fresh random IV for every encryption — critical for AES-GCM security
  const iv = await Crypto.getRandomBytesAsync(IV_LENGTH);

  const plaintextBytes = new TextEncoder().encode(plaintext);

  // SubtleCrypto is available in React Native via the Hermes engine
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    plaintextBytes,
  );

  // Concatenate: IV || ciphertext (ciphertext already includes the auth tag in GCM)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Base64-encode for storage/transmission
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64-encoded AES-256-GCM ciphertext.
 * Throws if the auth tag is invalid (tampered data).
 */
export async function decrypt(encryptedBase64: string, keyBytes: Uint8Array): Promise<string> {
  const key = await importKey(keyBytes);

  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Split IV from ciphertext
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      key,
      ciphertext,
    );
  } catch {
    // AES-GCM auth tag failure — either wrong key or tampered data
    throw new Error('DECRYPTION_FAILED: Wrong master password or tampered data');
  }

  return new TextDecoder().decode(plaintext);
}

/**
 * Imports a raw key bytes array as a CryptoKey for use with SubtleCrypto.
 */
async function importKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,          // not extractable — key can't be read back out of memory
    ['encrypt', 'decrypt'],
  );
}

/**
 * Computes SHA-256 of a string — used for content hashing (not encryption).
 * The hash is stored unencrypted on the server for deduplication purposes.
 */
export async function sha256(text: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text,
  );
  return hash;
}