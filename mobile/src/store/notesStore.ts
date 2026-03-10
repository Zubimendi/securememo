import { create } from 'zustand';
import { encrypt, decrypt, sha256 } from '../crypto/aes';

export interface Note {
  id: string;
  title: string;          // PLAINTEXT — in memory only, never persisted
  content: string;        // PLAINTEXT — in memory only
  folder: string | null;
  tags: string[];
  pinned: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  isLoading: boolean;

  // Load encrypted notes from server, decrypt with vault key
  loadNotes: (encryptedNotes: EncryptedNoteFromAPI[], vaultKey: Uint8Array) => Promise<void>;

  // Encrypt a note before sending to server
  encryptNote: (note: Pick<Note, 'title' | 'content' | 'folder' | 'tags'>, vaultKey: Uint8Array) => Promise<EncryptedPayload>;

  // Decrypt a single note received from API
  decryptNote: (encrypted: EncryptedNoteFromAPI, vaultKey: Uint8Array) => Promise<Note>;

  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // CRITICAL: wipe all plaintext from memory on lock
  clearMemory: () => void;
}

interface EncryptedNoteFromAPI {
  id: string;
  encryptedTitle: string;
  encryptedContent: string;
  encryptedFolder: string | null;
  encryptedTags: string | null;
  pinned: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedPayload {
  encryptedTitle: string;
  encryptedContent: string;
  encryptedFolder: string | null;
  encryptedTags: string | null;
  contentHash: string;
  byteSize: number;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,

  loadNotes: async (encryptedNotes, vaultKey) => {
    set({ isLoading: true });
    const decrypted = await Promise.all(
      encryptedNotes.map(n => get().decryptNote(n, vaultKey))
    );
    set({ notes: decrypted, isLoading: false });
  },

  encryptNote: async (note, vaultKey) => {
    const [
      encryptedTitle,
      encryptedContent,
      contentHash,
    ] = await Promise.all([
      encrypt(note.title || 'Untitled', vaultKey),
      encrypt(note.content, vaultKey),
      sha256(note.content),
    ]);

    const encryptedFolder = note.folder
      ? await encrypt(note.folder, vaultKey)
      : null;

    const encryptedTags = note.tags.length > 0
      ? await encrypt(JSON.stringify(note.tags), vaultKey)
      : null;

    return {
      encryptedTitle,
      encryptedContent,
      encryptedFolder,
      encryptedTags,
      contentHash,
      byteSize: encryptedContent.length,
    };
  },

  decryptNote: async (encrypted, vaultKey) => {
    const [title, content] = await Promise.all([
      decrypt(encrypted.encryptedTitle, vaultKey),
      decrypt(encrypted.encryptedContent, vaultKey),
    ]);

    const folder = encrypted.encryptedFolder
      ? await decrypt(encrypted.encryptedFolder, vaultKey)
      : null;

    let tags: string[] = [];
    if (encrypted.encryptedTags) {
      const tagsJson = await decrypt(encrypted.encryptedTags, vaultKey);
      tags = JSON.parse(tagsJson);
    }

    return {
      id: encrypted.id,
      title,
      content,
      folder,
      tags,
      pinned: encrypted.pinned,
      deleted: encrypted.deleted,
      createdAt: encrypted.createdAt,
      updatedAt: encrypted.updatedAt,
    };
  },

  addNote: (note) => set(state => ({ notes: [note, ...state.notes] })),

  updateNote: (id, updates) => set(state => ({
    notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n),
  })),

  deleteNote: (id) => set(state => ({
    notes: state.notes.map(n => n.id === id ? { ...n, deleted: true } : n),
  })),

  clearMemory: () => {
    // Overwrite notes array — GC will handle actual memory
    set({ notes: [] });
  },
}));