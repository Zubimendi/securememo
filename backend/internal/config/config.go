package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port           string
	SupabaseURL    string
	SupabaseKey    string   // service_role key — backend only, never exposed to client
	SupabaseJWTSecret string
	DatabaseURL    string
	AllowedOrigins []string
	Environment    string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		SupabaseURL:       os.Getenv("SUPABASE_URL"),
		SupabaseKey:       os.Getenv("SUPABASE_SERVICE_KEY"),
		SupabaseJWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		Environment:       getEnv("ENVIRONMENT", "development"),
		AllowedOrigins:    []string{"*"}, // tighten in production
	}

	if cfg.SupabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_URL is required")
	}
	if cfg.SupabaseJWTSecret == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET is required")
	}
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}