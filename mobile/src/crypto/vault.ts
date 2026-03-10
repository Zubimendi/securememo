import * as SecureStore from 'expo-secure-store';
import { deriveVaultKey, deriveRecoveryKey, DerivedKey } from './argon2';
import { encrypt, decrypt } from './aes';
import * as Crypto from 'expo-crypto';

// Keys used in SecureStore (device keychain)
const VAULT_KEY_STORE_KEY   = 'securememo.vaultKey';
const VAULT_SALT_STORE_KEY  = 'securememo.vaultSalt';
const VAULT_SETUP_FLAG      = 'securememo.isSetup';

export interface VaultSetupResult {
  // These go to the backend
  encryptedVaultKey:    string;  // AES-GCM(vaultKey, masterPasswordDerivedKey)
  argon2Salt:           string;  // hex — stored in vault_configs
  argon2Memory:         number;
  argon2Iterations:     number;
  argon2Parallelism:    number;
  encryptedRecoveryKey: string;  // AES-GCM(vaultKey, recoveryKeyDerivedKey)
  recoveryKeySalt:      string;  // hex — stored in vault_configs
  recoveryPhrase:       string;  // 16-word phrase shown ONCE to user, never stored
}

/**
 * First-time vault setup.
 *
 * 1. Generate a random 256-bit vault key
 * 2. Derive a key from the master password using Argon2id
 * 3. Encrypt the vault key with the master-password-derived key
 * 4. Generate a recovery phrase and derive a key from it
 * 5. Encrypt the vault key with the recovery-derived key (backup)
 * 6. Store the vault key in the device keychain for this session
 *
 * The vault key is the ACTUAL encryption key for notes.
 * The master password just protects access to the vault key.
 */
export async function createVault(masterPassword: string): Promise<VaultSetupResult> {
  // Generate the vault key — this is what encrypts notes
  const vaultKeyBytes = await Crypto.getRandomBytesAsync(32);
  const vaultKeyHex = Array.from(vaultKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Derive a key from master password
  const masterDerived = await deriveVaultKey(masterPassword);

  // Encrypt vault key with master-password-derived key
  const encryptedVaultKey = await encrypt(vaultKeyHex, masterDerived.key);

  // Generate recovery phrase (128 bits of entropy = 16 BIP-39 words)
  const recoveryPhrase = await generateRecoveryPhrase();

  // Derive a key from the recovery phrase
  const recoveryDerived = await deriveRecoveryKey(recoveryPhrase);

  // Encrypt vault key with recovery key (backup method)
  const encryptedRecoveryKey = await encrypt(vaultKeyHex, recoveryDerived.key);

  // Store vault key in device keychain — survives app restart, requires biometric
  await SecureStore.setItemAsync(VAULT_KEY_STORE_KEY, vaultKeyHex, {
    requireAuthentication: false, // biometric enforced at app layer
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(VAULT_SALT_STORE_KEY, masterDerived.salt);
  await SecureStore.setItemAsync(VAULT_SETUP_FLAG, 'true');

  return {
    encryptedVaultKey,
    argon2Salt:           masterDerived.salt,
    argon2Memory:         masterDerived.params.memory,
    argon2Iterations:     masterDerived.params.iterations,
    argon2Parallelism:    masterDerived.params.parallelism,
    encryptedRecoveryKey,
    recoveryKeySalt:      recoveryDerived.salt,
    recoveryPhrase,       // shown ONCE to user — we never store this
  };
}

/**
 * Unlocks the vault using the master password.
 * Fetches vault config from backend, derives the master key, decrypts vault key.
 * Returns the vault key bytes for use in note encryption/decryption.
 */
export async function unlockVault(
  masterPassword: string,
  encryptedVaultKey: string,
  argon2Salt: string,
  argon2Params: { memory: number; iterations: number; parallelism: number }
): Promise<Uint8Array> {
  // Re-derive the key from the master password using stored salt
  const derived = await deriveVaultKey(masterPassword, argon2Salt);

  // Decrypt the vault key
  const vaultKeyHex = await decrypt(encryptedVaultKey, derived.key);

  // Store in keychain for this session
  await SecureStore.setItemAsync(VAULT_KEY_STORE_KEY, vaultKeyHex, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return hexToBytes(vaultKeyHex);
}

/**
 * Gets the vault key from the device keychain.
 * Returns null if the vault is locked (key not in keychain).
 */
export async function getVaultKey(): Promise<Uint8Array | null> {
  const hex = await SecureStore.getItemAsync(VAULT_KEY_STORE_KEY);
  if (!hex) return null;
  return hexToBytes(hex);
}

/**
 * Locks the vault by clearing the key from the keychain.
 * Notes in memory become inaccessible — the notesStore must be cleared too.
 */
export async function lockVault(): Promise<void> {
  await SecureStore.deleteItemAsync(VAULT_KEY_STORE_KEY);
}

export async function isVaultSetup(): Promise<boolean> {
  const flag = await SecureStore.getItemAsync(VAULT_SETUP_FLAG);
  return flag === 'true';
}

// BIP-39 wordlist subset (use full wordlist in production)
const WORD_LIST = [
  'abandon','ability','able','about','above','absent','absorb','abstract',
  'absurd','abuse','access','accident','account','accuse','achieve','acid',
  'acoustic','acquire','across','act','action','actor','actress','actual',
  'adapt','add','addict','address','adjust','admit','adult','advance',
  // ... include full 2048-word BIP-39 list
];

async function generateRecoveryPhrase(): Promise<string> {
  const words: string[] = [];
  for (let i = 0; i < 16; i++) {
    const randomBytes = await Crypto.getRandomBytesAsync(2);
    const index = ((randomBytes[0] << 8) | randomBytes[1]) % WORD_LIST.length;
    words.push(WORD_LIST[index]);
  }
  return words.join(' ');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}