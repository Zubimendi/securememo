-- Enable RLS on all tables
-- Users table is managed by Supabase Auth

CREATE TABLE vault_configs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_vault_key   TEXT NOT NULL,
    argon2_memory         INTEGER NOT NULL DEFAULT 65536,
    argon2_iterations     INTEGER NOT NULL DEFAULT 3,
    argon2_parallelism    INTEGER NOT NULL DEFAULT 4,
    argon2_salt           TEXT NOT NULL,
    encrypted_recovery_key TEXT NOT NULL,
    recovery_key_salt     TEXT NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_title   TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    encrypted_folder  TEXT,
    encrypted_tags    TEXT,
    content_hash      TEXT NOT NULL,
    byte_size         INTEGER NOT NULL DEFAULT 0,
    pinned            BOOLEAN NOT NULL DEFAULT FALSE,
    deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id    ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_deleted    ON notes(user_id, deleted);
CREATE INDEX idx_notes_pinned     ON notes(user_id, pinned DESC);

CREATE TABLE deleted_note_tombstones (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_id    UUID NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- Row Level Security — users can only touch their own data
ALTER TABLE vault_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_note_tombstones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their vault config"
    ON vault_configs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users own their notes"
    ON notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users own their tombstones"
    ON deleted_note_tombstones FOR ALL USING (auth.uid() = user_id);
