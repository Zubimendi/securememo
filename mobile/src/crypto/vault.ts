import { deriveVaultKey } from './argon2';
import { encrypt, decrypt } from './aes';

/**
 * The vault state manager. Handles:
 * 1. Unlocking the vault using the master password.
 * 2. Keeping the derived key in-memory during a session.
 * 3. Clearing the key when the app locks.
 */

export class Vault {
  private static instance: Vault;
  private vaultKey: Uint8Array | null = null;
  private salt: string | null = null;

  private constructor() {}

  static getInstance(): Vault {
    if (!Vault.instance) {
      Vault.instance = new Vault();
    }
    return Vault.instance;
  }

  /**
   * Unlocks the vault given the master password and stored salt.
   * If the vault is already open, it returns the existing key.
   */
  async unlock(password: string, salt: string): Promise<boolean> {
    try {
      const derived = await deriveVaultKey(password, salt);
      this.vaultKey = derived.key;
      this.salt = salt;
      return true;
    } catch (e) {
      console.error('Vault unlock failed:', e);
      return false;
    }
  }

  /**
   * Clears the derived key from memory.
   * This is called on auto-lock or manual lock.
   */
  lock(): void {
    if (this.vaultKey) {
      this.vaultKey.fill(0); // Zero out for security
      this.vaultKey = null;
    }
    this.salt = null;
  }

  isOpen(): boolean {
    return this.vaultKey !== null;
  }

  /**
   * Gets the active vault key. Throws if locked.
   */
  getVaultKey(): Uint8Array {
    if (!this.vaultKey) {
      throw new Error('Vault is locked. No access to key.');
    }
    return this.vaultKey;
  }

  /**
   * Encrypts a note component (title, content, folder, etc.)
   */
  async encryptValue(plaintext: string): Promise<string> {
    return encrypt(plaintext, this.getVaultKey());
  }

  /**
   * Decrypts a note component.
   */
  async decryptValue(ciphertext: string): Promise<string> {
    return decrypt(ciphertext, this.getVaultKey());
  }
}

export const vault = Vault.getInstance();
