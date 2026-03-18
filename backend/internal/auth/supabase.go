package auth

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userID"
const UserEmailKey contextKey = "userEmail"

// ValidateSupabaseJWT middleware extracts and validates the Supabase JWT.
// The user ID and email are injected into the request context.
func ValidateSupabaseJWT(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				log.Printf("⚠️ Auth failed: missing authorization header")
				http.Error(w, "missing authorization header", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenStr == authHeader {
				log.Printf("⚠️ Auth failed: invalid authorization format")
				http.Error(w, "invalid authorization format — use Bearer <token>", http.StatusUnauthorized)
				return
			}

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				log.Printf("❌ Auth failed: invalid token: %v", err)
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "invalid token claims", http.StatusUnauthorized)
				return
			}

			userID, ok := claims["sub"].(string)
			if !ok || userID == "" {
				log.Printf("⚠️ Auth failed: missing user ID in claims")
				http.Error(w, "missing user ID in token", http.StatusUnauthorized)
				return
			}

			email, _ := claims["email"].(string)

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			if email != "" {
				ctx = context.WithValue(ctx, UserEmailKey, email)
				log.Printf("👤 Validated session for user: %s", email)
			}
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserEmailFromContext extracts the authenticated user email from context.
func UserEmailFromContext(ctx context.Context) string {
	email, _ := ctx.Value(UserEmailKey).(string)
	return email
}

// UserIDFromContext extracts the authenticated user ID from context.
func UserIDFromContext(ctx context.Context) (string, error) {
	id, ok := ctx.Value(UserIDKey).(string)
	if !ok || id == "" {
		return "", fmt.Errorf("unauthenticated")
	}
	return id, nil
}