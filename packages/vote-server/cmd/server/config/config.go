package config

import (
	"flag"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type Config struct {
	application.Config

	redisUrl string
	listen   string
}

func New() *Config {
	var listen string
	flag.StringVar(&listen, "listen", ":8090", "Specifies the address to bind against.")

	var redisUrl string
	flag.StringVar(&redisUrl, "redis", "localhost:6379", "Redis connection address")

	flag.Parse()

	return &Config{
		redisUrl: redisUrl,
		listen:   listen,
	}
}

func (c *Config) RedisUrl() string {
	return c.redisUrl
}

func (c *Config) Listen() string {
	return c.listen
}
