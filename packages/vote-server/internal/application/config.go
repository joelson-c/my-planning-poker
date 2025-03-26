package application

type Config interface {
	RedisUrl() string
	Listen() string
}
