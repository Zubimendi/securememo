import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('securememo.db');

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      folder TEXT,
      tags TEXT,
      pinned INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );
  `);
};
