import { deriveRecoveryKey, bytesToHex, hexToBytes } from './argon2';
import { encrypt, decrypt } from './aes';

const RECOVERY_WORDS = [
  'apple', 'beach', 'candy', 'dream', 'eagle', 'flame', 'grape', 'honey',
  'ice', 'joker', 'koala', 'lemon', 'music', 'night', 'ocean', 'piano',
  'queen', 'river', 'stone', 'tiger', 'urban', 'voice', 'water', 'xenon',
  'young', 'zebra', 'amber', 'blade', 'clear', 'dance', 'earth', 'frost',
];

/**
 * Generates a 16-word recovery phrase for the user.
 * This can be used to recover the vault key if the password is lost.
 */
export async function generateRecoveryPhrase(): Promise<string> {
  const phrase: string[] = [];
  for (let i = 0; i < 16; i++) {
    // We can use Crypto for secure random numbers if needed, 
    // but just picking randomly from our list for now.
    const randomIdx = Math.floor(Math.random() * RECOVERY_WORDS.length);
    phrase.push(RECOVERY_WORDS[randomIdx]);
  }
  return phrase.join('-');
}

/**
 * Encrypts the raw vault key with a key derived from the recovery phrase.
 * This encrypted blob is then stored on the server.
 *
 * @param vaultKey       - The 32-byte vault key to back up
 * @param recoveryPhrase - The 16-word phrase
 * @returns              - [EncryptedVaultKey, Salt]
 */
export async function encryptVaultKeyWithRecovery(
  vaultKey: Uint8Array,
  recoveryPhrase: string
): Promise<{ encrypted: string; salt: string }> {
  const derived = await deriveRecoveryKey(recoveryPhrase);
  const vaultKeyHex = bytesToHex(vaultKey);
  const encrypted = await encrypt(vaultKeyHex, derived.key);

  return {
    encrypted,
    salt: derived.salt,
  };
}

/**
 * Recovers the original vault key using a recovery phrase and the stored salt.
 *
 * @param recoveryPhrase - Provided by user
 * @param salt           - From vault config
 * @param encrypted      - From vault config
 */
export async function recoverVaultKey(
  recoveryPhrase: string,
  salt: string,
  encrypted: string
): Promise<Uint8Array | null> {
  try {
    const derived = await deriveRecoveryKey(recoveryPhrase, salt);
    const vaultKeyHex = await decrypt(encrypted, derived.key);
    return hexToBytes(vaultKeyHex);
  } catch (e) {
    console.error('Recovery failed:', e);
    return null;
  }
}
