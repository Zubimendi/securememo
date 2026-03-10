import { create } from 'zustand';
import { getVaultKey, lockVault } from '../crypto/vault';
import { useNotesStore } from './notesStore';

interface VaultState {
  isUnlocked: boolean;
  vaultKey: Uint8Array | null;
  userID: string | null;
  email: string | null;

  unlock: (key: Uint8Array, userID: string, email: string) => void;
  lock: () => Promise<void>;
  hydrate: () => Promise<boolean>;
}

export const useVaultStore = create<VaultState>((set) => ({
  isUnlocked: false,
  vaultKey: null,
  userID: null,
  email: null,

  unlock: (key, userID, email) => {
    set({ isUnlocked: true, vaultKey: key, userID, email });
  },

  lock: async () => {
    await lockVault();
    set({ isUnlocked: false, vaultKey: null });
    // Clear notes from memory
    useNotesStore.getState().clearMemory();
  },

  // On app foreground — check if vault key is still in keychain
  hydrate: async () => {
    const key = await getVaultKey();
    if (key) {
      set({ isUnlocked: true, vaultKey: key });
      return true;
    }
    set({ isUnlocked: false, vaultKey: null });
    return false;
  },
}));