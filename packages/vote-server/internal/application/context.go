package application

import (
	"github.com/redis/go-redis/v9"
)

type AppContext struct {
	Redis  *redis.Client
	Config Config
}

func NewContext(options ...contextOption) *AppContext {
	var ctx AppContext

	for _, option := range options {
		option(&ctx)
	}

	return &ctx
}

type contextOption = func(ctx *AppContext)

func WithConfig(c Config) contextOption {
	return func(ctx *AppContext) {
		ctx.Config = c
	}
}

func WithRedis(r *redis.Client) contextOption {
	return func(ctx *AppContext) {
		ctx.Redis = r
	}
}
