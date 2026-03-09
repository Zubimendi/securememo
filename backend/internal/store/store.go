package store

import (
	"context"
	"time"
)

// Note is the server-side representation — all content is ciphertext.
type Note struct {
	ID               string
	UserID           string
	EncryptedTitle   string
	EncryptedContent string
	EncryptedFolder  *string
	EncryptedTags    *string
	ContentHash      string
	ByteSize         int
	Pinned           bool
	Deleted          bool
	DeletedAt        *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
	SyncedAt         *time.Time
}

// VaultConfig stores the user's vault setup parameters server-side.
type VaultConfig struct {
	ID                   string
	UserID               string
	EncryptedVaultKey    string
	Argon2Memory         int
	Argon2Iterations     int
	Argon2Parallelism    int
	Argon2Salt           string
	EncryptedRecoveryKey string
	RecoveryKeySalt      string
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// Store defines all database operations. Both Supabase and a mock
// implement this — making tests not depend on a real database.
type Store interface {
	// Vault
	GetVaultConfig(ctx context.Context, userID string) (*VaultConfig, error)
	CreateVaultConfig(ctx context.Context, cfg VaultConfig) (*VaultConfig, error)
	UpdateVaultConfig(ctx context.Context, cfg VaultConfig) (*VaultConfig, error)

	// Notes
	CreateNote(ctx context.Context, note Note) (*Note, error)
	UpdateNote(ctx context.Context, note Note) (*Note, error)
	GetNote(ctx context.Context, userID, noteID string) (*Note, error)
	ListNotes(ctx context.Context, userID string, limit, offset int, includeDeleted bool) ([]*Note, error)
	SyncNotes(ctx context.Context, userID string, since time.Time) ([]*Note, []string, error)
	SoftDeleteNote(ctx context.Context, userID, noteID string) error
	HardDeleteNote(ctx context.Context, userID, noteID string) error
	RestoreNote(ctx context.Context, userID, noteID string) error
	EmptyTrash(ctx context.Context, userID string) error
	GetNoteCount(ctx context.Context, userID string) (int, error)
}