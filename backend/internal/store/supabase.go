package store

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SupabaseStore struct {
	pool *pgxpool.Pool
}

type AuditLog struct {
	UserID    string
	Action    string
	Metadata  map[string]interface{}
	IPAddress string
	UserAgent string
}

func NewSupabaseStore(ctx context.Context, dsn string) (*SupabaseStore, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("connecting to supabase: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("pinging supabase: %w", err)
	}
	return &SupabaseStore{pool: pool}, nil
}

func (s *SupabaseStore) CreateNote(ctx context.Context, note Note) (*Note, error) {
	row := s.pool.QueryRow(ctx, `
		INSERT INTO notes (
			user_id, encrypted_title, encrypted_content,
			encrypted_folder, encrypted_tags,
			content_hash, byte_size, pinned
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, created_at, updated_at`,
		note.UserID, note.EncryptedTitle, note.EncryptedContent,
		note.EncryptedFolder, note.EncryptedTags,
		note.ContentHash, note.ByteSize, note.Pinned,
	)

	if err := row.Scan(&note.ID, &note.CreatedAt, &note.UpdatedAt); err != nil {
		return nil, fmt.Errorf("insert note: %w", err)
	}
	return &note, nil
}

func (s *SupabaseStore) UpdateNote(ctx context.Context, note Note) (*Note, error) {
	row := s.pool.QueryRow(ctx, `
		UPDATE notes SET
			encrypted_title   = COALESCE(NULLIF($1,''), encrypted_title),
			encrypted_content = COALESCE(NULLIF($2,''), encrypted_content),
			encrypted_folder  = $3,
			encrypted_tags    = $4,
			content_hash      = COALESCE(NULLIF($5,''), content_hash),
			byte_size         = COALESCE(NULLIF($6,0), byte_size),
			pinned            = $7,
			updated_at        = NOW()
		WHERE id = $8 AND user_id = $9
		RETURNING id, created_at, updated_at`,
		note.EncryptedTitle, note.EncryptedContent,
		note.EncryptedFolder, note.EncryptedTags,
		note.ContentHash, note.ByteSize, note.Pinned,
		note.ID, note.UserID,
	)
	if err := row.Scan(&note.ID, &note.CreatedAt, &note.UpdatedAt); err != nil {
		return nil, fmt.Errorf("update note: %w", err)
	}
	return &note, nil
}

func (s *SupabaseStore) ListNotes(ctx context.Context, userID string, limit, offset int, includeDeleted bool) ([]*Note, error) {
	query := `
		SELECT id, user_id, encrypted_title, encrypted_content,
			   encrypted_folder, encrypted_tags, content_hash,
			   byte_size, pinned, deleted, deleted_at, created_at, updated_at
		FROM notes
		WHERE user_id = $1`

	if !includeDeleted {
		query += " AND deleted = false"
	}
	query += " ORDER BY pinned DESC, updated_at DESC LIMIT $2 OFFSET $3"

	rows, err := s.pool.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*Note
	for rows.Next() {
		n := &Note{}
		if err := rows.Scan(
			&n.ID, &n.UserID, &n.EncryptedTitle, &n.EncryptedContent,
			&n.EncryptedFolder, &n.EncryptedTags, &n.ContentHash,
			&n.ByteSize, &n.Pinned, &n.Deleted, &n.DeletedAt,
			&n.CreatedAt, &n.UpdatedAt,
		); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, rows.Err()
}

func (s *SupabaseStore) SyncNotes(ctx context.Context, userID string, since time.Time) ([]*Note, []string, error) {
	// Returns notes updated since `since` + IDs of hard-deleted notes
	rows, err := s.pool.Query(ctx, `
		SELECT id, user_id, encrypted_title, encrypted_content,
			   encrypted_folder, encrypted_tags, content_hash,
			   byte_size, pinned, deleted, deleted_at, created_at, updated_at
		FROM notes
		WHERE user_id = $1 AND updated_at > $2
		ORDER BY updated_at ASC`,
		userID, since,
	)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var notes []*Note
	for rows.Next() {
		n := &Note{}
		if err := rows.Scan(
			&n.ID, &n.UserID, &n.EncryptedTitle, &n.EncryptedContent,
			&n.EncryptedFolder, &n.EncryptedTags, &n.ContentHash,
			&n.ByteSize, &n.Pinned, &n.Deleted, &n.DeletedAt,
			&n.CreatedAt, &n.UpdatedAt,
		); err != nil {
			return nil, nil, err
		}
		notes = append(notes, n)
	}

	// Fetch permanently deleted IDs from the tombstone table
	tombstoneRows, err := s.pool.Query(ctx, `
		SELECT note_id FROM deleted_note_tombstones
		WHERE user_id = $1 AND deleted_at > $2`,
		userID, since,
	)
	if err != nil {
		return notes, nil, err
	}
	defer tombstoneRows.Close()

	var deletedIDs []string
	for tombstoneRows.Next() {
		var id string
		if err := tombstoneRows.Scan(&id); err != nil {
			return notes, nil, err
		}
		deletedIDs = append(deletedIDs, id)
	}

	return notes, deletedIDs, nil
}

func (s *SupabaseStore) GetVaultConfig(ctx context.Context, userID string) (*VaultConfig, error) {
	cfg := &VaultConfig{}
	err := s.pool.QueryRow(ctx, `
		SELECT id, user_id, encrypted_vault_key, argon2_memory, argon2_iterations,
			   argon2_parallelism, argon2_salt, encrypted_recovery_key, recovery_key_salt,
			   created_at, updated_at
		FROM vault_configs WHERE user_id = $1`, userID,
	).Scan(
		&cfg.ID, &cfg.UserID, &cfg.EncryptedVaultKey,
		&cfg.Argon2Memory, &cfg.Argon2Iterations, &cfg.Argon2Parallelism,
		&cfg.Argon2Salt, &cfg.EncryptedRecoveryKey, &cfg.RecoveryKeySalt,
		&cfg.CreatedAt, &cfg.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

func (s *SupabaseStore) CreateVaultConfig(ctx context.Context, cfg VaultConfig) (*VaultConfig, error) {
	err := s.pool.QueryRow(ctx, `
		INSERT INTO vault_configs (
			user_id, encrypted_vault_key, argon2_memory, argon2_iterations,
			argon2_parallelism, argon2_salt, encrypted_recovery_key, recovery_key_salt
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, created_at, updated_at`,
		cfg.UserID, cfg.EncryptedVaultKey, cfg.Argon2Memory, cfg.Argon2Iterations,
		cfg.Argon2Parallelism, cfg.Argon2Salt, cfg.EncryptedRecoveryKey, cfg.RecoveryKeySalt,
	).Scan(&cfg.ID, &cfg.CreatedAt, &cfg.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create vault config: %w", err)
	}
	return &cfg, nil
}

// Implement remaining Store methods similarly...
func (s *SupabaseStore) SoftDeleteNote(ctx context.Context, userID, noteID string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE notes SET deleted = true, deleted_at = NOW(), updated_at = NOW()
		 WHERE id = $1 AND user_id = $2`, noteID, userID)
	return err
}

func (s *SupabaseStore) HardDeleteNote(ctx context.Context, userID, noteID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `DELETE FROM notes WHERE id = $1 AND user_id = $2`, noteID, userID)
	if err != nil {
		return err
	}
	// Write tombstone so other devices know to delete this note on sync
	_, err = tx.Exec(ctx,
		`INSERT INTO deleted_note_tombstones (user_id, note_id) VALUES ($1, $2)
		 ON CONFLICT DO NOTHING`, userID, noteID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *SupabaseStore) RestoreNote(ctx context.Context, userID, noteID string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE notes SET deleted = false, deleted_at = NULL, updated_at = NOW()
		 WHERE id = $1 AND user_id = $2`, noteID, userID)
	return err
}

func (s *SupabaseStore) EmptyTrash(ctx context.Context, userID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Get IDs of notes to be deleted for tombstones
	rows, err := tx.Query(ctx, `SELECT id FROM notes WHERE user_id = $1 AND deleted = true`, userID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return err
		}
		ids = append(ids, id)
	}

	if len(ids) == 0 {
		return nil
	}

	// Delete notes
	_, err = tx.Exec(ctx, `DELETE FROM notes WHERE user_id = $1 AND deleted = true`, userID)
	if err != nil {
		return err
	}

	// Insert tombstones
	for _, id := range ids {
		_, err = tx.Exec(ctx,
			`INSERT INTO deleted_note_tombstones (user_id, note_id) VALUES ($1, $2)
			 ON CONFLICT DO NOTHING`, userID, id)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (s *SupabaseStore) GetNote(ctx context.Context, userID, noteID string) (*Note, error) {
	n := &Note{}
	err := s.pool.QueryRow(ctx, `
		SELECT id, user_id, encrypted_title, encrypted_content,
			   encrypted_folder, encrypted_tags, content_hash,
			   byte_size, pinned, deleted, deleted_at, created_at, updated_at
		FROM notes WHERE id = $1 AND user_id = $2`, noteID, userID,
	).Scan(
		&n.ID, &n.UserID, &n.EncryptedTitle, &n.EncryptedContent,
		&n.EncryptedFolder, &n.EncryptedTags, &n.ContentHash,
		&n.ByteSize, &n.Pinned, &n.Deleted, &n.DeletedAt,
		&n.CreatedAt, &n.UpdatedAt,
	)
	return n, err
}

func (s *SupabaseStore) GetNoteCount(ctx context.Context, userID string) (int, error) {
	var count int
	err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM notes WHERE user_id = $1 AND deleted = false`, userID,
	).Scan(&count)
	return count, err
}

func (s *SupabaseStore) UpdateVaultConfig(ctx context.Context, cfg VaultConfig) (*VaultConfig, error) {
	err := s.pool.QueryRow(ctx, `
		UPDATE vault_configs SET
			encrypted_vault_key    = $1,
			argon2_memory          = $2,
			argon2_iterations      = $3,
			argon2_parallelism     = $4,
			argon2_salt            = $5,
			encrypted_recovery_key = $6,
			recovery_key_salt      = $7,
			updated_at             = NOW()
		WHERE user_id = $8
		RETURNING id, created_at, updated_at`,
		cfg.EncryptedVaultKey, cfg.Argon2Memory, cfg.Argon2Iterations,
		cfg.Argon2Parallelism, cfg.Argon2Salt, cfg.EncryptedRecoveryKey,
		cfg.RecoveryKeySalt, cfg.UserID,
	).Scan(&cfg.ID, &cfg.CreatedAt, &cfg.UpdatedAt)
	return &cfg, err
}

func (s *SupabaseStore) CreateAuditLog(ctx context.Context, entry AuditLog) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, metadata, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5)`,
		entry.UserID, entry.Action, entry.Metadata, entry.IPAddress, entry.UserAgent,
	)
	if err != nil {
		log.Printf("⚠️ Failed to write audit log: %v", err)
	}
	return err
}