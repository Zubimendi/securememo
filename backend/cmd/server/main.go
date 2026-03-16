package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/Zubimendi/securememo/internal/auth"
	"github.com/Zubimendi/securememo/internal/graphql"
	"github.com/Zubimendi/securememo/internal/store"
)

func main() {
	// 1. Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("SUPABASE_JWT_SECRET is not set")
	}

	ctx := context.Background()

	// 2. Initialize Database Store
	s, err := store.NewSupabaseStore(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to initialize store: %v", err)
	}

	// 3. Setup GraphQL Resolver
	resolver := &graphql.Resolver{
		Store: s,
	}

	// 4. Create GraphQL Handler
	srv := handler.NewDefaultServer(graphql.NewExecutableSchema(graphql.Config{Resolvers: resolver}))

	// 5. Setup Router with Middleware
	r := chi.NewRouter()

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Adjust for production
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	r.Use(c.Handler)

	// Playground (unauthenticated)
	r.Handle("/", playground.Handler("GraphQL playground", "/query"))

	// API Route (with Supabase JWT validation)
	r.Group(func(r chi.Router) {
		r.Use(auth.ValidateSupabaseJWT(jwtSecret))
		r.Handle("/query", srv)
	})

	log.Printf("Connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
