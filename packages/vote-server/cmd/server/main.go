package main

import (
	"context"
	"log"

	"github.com/joelson-c/my-planning-poker/cmd/server/config"
	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/broker"
	"github.com/joelson-c/my-planning-poker/internal/client"
	"github.com/joelson-c/my-planning-poker/internal/http"
	"github.com/joelson-c/my-planning-poker/internal/room"
	"github.com/joelson-c/my-planning-poker/internal/session"
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

	appCtx := application.NewContext(
		application.WithConfig(c),
		application.WithRedis(r),
	)

	app := application.New(
		appCtx,
		http.NewServer(),
		room.NewHandler(appCtx),
		client.NewHandler(),
		broker.NewRedis(appCtx),
		session.NewHandler(appCtx),
	)

	log.Println("main: starting http server")

	ctx := context.Background()
	if err := app.Run(ctx); err != nil {
		log.Fatalf("main: failed to run server: %v", err)
	}

	log.Println("main: server was shutdown gracefully")
}
