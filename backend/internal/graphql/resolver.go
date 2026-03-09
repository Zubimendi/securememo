package graphql

import (
	"context"
	"time"

	"github.com/Zubimendi/securememo/internal/auth"
	"github.com/Zubimendi/securememo/internal/store"
)

// This file will not be regenerated automatically.
// Use it to implement your resolver logic!

type Resolver struct {
	Store store.Store
}

// ─── QUERY RESOLVERS ─────────────────────────────────────────────────────────

func (r *queryResolver) Me(ctx context.Context) (*User, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	// For now, return basic user info. Real version would hit supabase auth or a users table.
	count, _ := r.Store.GetNoteCount(ctx, userID)
	return &User{
		ID:        userID,
		Email:     "user@example.com", // Fetch from JWT if needed
		NoteCount: count,
		CreatedAt: time.Now().Format(time.RFC3339),
	}, nil
}

func (r *queryResolver) VaultConfig(ctx context.Context) (*store.VaultConfig, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	return r.Store.GetVaultConfig(ctx, userID)
}

func (r *queryResolver) Notes(ctx context.Context, limit *int, offset *int, includeDeleted *bool) ([]*store.Note, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	l, o, id := 50, 0, false
	if limit != nil {
		l = *limit
	}
	if offset != nil {
		o = *offset
	}
	if includeDeleted != nil {
		id = *includeDeleted
	}
	return r.Store.ListNotes(ctx, userID, l, o, id)
}

func (r *queryResolver) Note(ctx context.Context, id string) (*store.Note, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	return r.Store.GetNote(ctx, userID, id)
}

func (r *queryResolver) SyncNotes(ctx context.Context, since string) (*SyncResult, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	t, err := time.Parse(time.RFC3339, since)
	if err != nil {
		return nil, err
	}
	notes, deletedIDs, err := r.Store.SyncNotes(ctx, userID, t)
	if err != nil {
		return nil, err
	}
	return &SyncResult{
		Notes:      notes,
		DeletedIds: deletedIDs,
		ServerTime: time.Now().Format(time.RFC3339),
	}, nil
}

// ─── MUTATION RESOLVERS ──────────────────────────────────────────────────────

func (r *mutationResolver) SetupVault(ctx context.Context, input SetupVaultInput) (*store.VaultConfig, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	cfg := store.VaultConfig{
		UserID:               userID,
		EncryptedVaultKey:    input.EncryptedVaultKey,
		Argon2Memory:         input.Argon2Memory,
		Argon2Iterations:     input.Argon2Iterations,
		Argon2Parallelism:    input.Argon2Parallelism,
		Argon2Salt:           input.Argon2Salt,
		EncryptedRecoveryKey: input.EncryptedRecoveryKey,
		RecoveryKeySalt:      input.RecoveryKeySalt,
	}
	return r.Store.CreateVaultConfig(ctx, cfg)
}

func (r *mutationResolver) CreateNote(ctx context.Context, input CreateNoteInput) (*store.Note, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	note := store.Note{
		UserID:           userID,
		EncryptedTitle:   input.EncryptedTitle,
		EncryptedContent: input.EncryptedContent,
		EncryptedFolder:  input.EncryptedFolder,
		EncryptedTags:    input.EncryptedTags,
		ContentHash:      input.ContentHash,
		ByteSize:         input.ByteSize,
		Pinned:           input.Pinned != nil && *input.Pinned,
	}
	return r.Store.CreateNote(ctx, note)
}

func (r *mutationResolver) UpdateNote(ctx context.Context, id string, input UpdateNoteInput) (*store.Note, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	note := store.Note{
		ID:     id,
		UserID: userID,
	}
	if input.EncryptedTitle != nil {
		note.EncryptedTitle = *input.EncryptedTitle
	}
	if input.EncryptedContent != nil {
		note.EncryptedContent = *input.EncryptedContent
	}
	note.EncryptedFolder = input.EncryptedFolder
	note.EncryptedTags = input.EncryptedTags
	if input.Pinned != nil {
		note.Pinned = *input.Pinned
	}
	return r.Store.UpdateNote(ctx, note)
}

func (r *mutationResolver) DeleteNote(ctx context.Context, id string) (bool, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return false, err
	}
	err = r.Store.SoftDeleteNote(ctx, userID, id)
	return err == nil, err
}

func (r *mutationResolver) PermanentlyDeleteNote(ctx context.Context, id string) (bool, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return false, err
	}
	err = r.Store.HardDeleteNote(ctx, userID, id)
	return err == nil, err
}

func (r *mutationResolver) RestoreNote(ctx context.Context, id string) (bool, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return false, err
	}
	err = r.Store.RestoreNote(ctx, userID, id)
	return err == nil, err
}

func (r *mutationResolver) EmptyTrash(ctx context.Context) (bool, error) {
	userID, err := auth.UserIDFromContext(ctx)
	if err != nil {
		return false, err
	}
	err = r.Store.EmptyTrash(ctx, userID)
	return err == nil, err
}

func (r *mutationResolver) UpdateVaultConfig(ctx context.Context, input SetupVaultInput) (*store.VaultConfig, error) {
    userID, err := auth.UserIDFromContext(ctx)
    if err != nil {
        return nil, err
    }
    cfg := store.VaultConfig{
        UserID:               userID,
		EncryptedVaultKey:    input.EncryptedVaultKey,
		Argon2Memory:         input.Argon2Memory,
		Argon2Iterations:     input.Argon2Iterations,
		Argon2Parallelism:    input.Argon2Parallelism,
		Argon2Salt:           input.Argon2Salt,
		EncryptedRecoveryKey: input.EncryptedRecoveryKey,
		RecoveryKeySalt:      input.RecoveryKeySalt,
    }
    return r.Store.UpdateVaultConfig(ctx, cfg)
}

// Boilerplate below is needed for gqlgen integration
type queryResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }

func (r *Resolver) Query() QueryResolver       { return &queryResolver{r} }
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }
