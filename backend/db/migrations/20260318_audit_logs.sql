-- Create audit_logs table to track sensitive actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,         -- e.g., 'VAULT_SETUP', 'NOTE_CREATE', 'LOGIN'
    metadata    JSONB DEFAULT '{}',     -- any additional context (e.g., folder_id, note_id)
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "users can view their own audit logs"
    ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Only the server (service_role/postgres) can insert audit logs
-- (If connecting via pgx as postgres, RLS is bypassed by default)
