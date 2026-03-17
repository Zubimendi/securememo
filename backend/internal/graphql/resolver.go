package graphql

//go:generate go run github.com/99designs/gqlgen generate

import (
	"github.com/Zubimendi/securememo/internal/store"
)

// This file will not be regenerated automatically.
// It serves as dependency injection for your app.

type Resolver struct {
	Store store.Store
}
