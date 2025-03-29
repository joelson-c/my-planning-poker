package application

import "github.com/redis/go-redis/v9"

type Application interface {
	Redis() *redis.Client
	Config() Config
	RoomHandler() RoomHandler
	ClientHandler() ClientHandler
	SessionHandler() SessionHandler
	BroadcastHandler() BroadcastHandler
	MessageRouter() MessageRouter
}
