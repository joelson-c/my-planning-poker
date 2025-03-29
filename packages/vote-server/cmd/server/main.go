package main

import (
	"context"
	"log"

	"github.com/joelson-c/my-planning-poker/cmd/server/config"
	"github.com/joelson-c/my-planning-poker/internal/application/base"
	"github.com/joelson-c/my-planning-poker/internal/http"
	"github.com/redis/go-redis/v9"
)

func main() {
	log.Println("main: bootstrapping app resources...")

	c := config.New()

	r := redis.NewClient(&redis.Options{
		Addr:     c.RedisUrl(),
		Password: "",
		DB:       0,
	})

	defer r.Close()

	app := base.New(
		c,
		r,
	)

	server := http.NewServer(app)
	log.Println("main: starting http server")

	ctx := context.Background()
	if err := server.Run(ctx); err != nil {
		log.Fatalf("main: failed to run server: %v", err)
	}

	log.Println("main: server was shutdown gracefully")
}
