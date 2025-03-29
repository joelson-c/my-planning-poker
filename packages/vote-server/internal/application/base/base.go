package base

import (
	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/handler"
	"github.com/joelson-c/my-planning-poker/internal/message"
	"github.com/redis/go-redis/v9"
)

type Application struct {
	application.Application

	redis            *redis.Client
	config           application.Config
	roomHandler      application.RoomHandler
	clientHandler    application.ClientHandler
	sessionHandler   application.SessionHandler
	broadcastHandler application.BroadcastHandler
	messageRouter    application.MessageRouter
}

func New(
	config application.Config,
	redis *redis.Client,
) *Application {
	app := &Application{
		redis:          redis,
		config:         config,
		roomHandler:    handler.NewRoom(redis),
		clientHandler:  handler.NewClient(redis),
		sessionHandler: handler.NewSession(redis),
		messageRouter:  message.NewRouter(),
	}

	app.broadcastHandler = handler.NewBroadcast(app.sessionHandler, app.roomHandler, app.clientHandler)

	message.SetUpRoutes(app.messageRouter)

	return app
}

func (a *Application) Redis() *redis.Client {
	return a.redis
}
func (a *Application) Config() application.Config {
	return a.config
}
func (a *Application) RoomHandler() application.RoomHandler {
	return a.roomHandler
}

func (a *Application) ClientHandler() application.ClientHandler {
	return a.clientHandler
}

func (a *Application) SessionHandler() application.SessionHandler {
	return a.sessionHandler
}

func (a *Application) BroadcastHandler() application.BroadcastHandler {
	return a.broadcastHandler
}

func (a *Application) MessageRouter() application.MessageRouter {
	return a.messageRouter
}
