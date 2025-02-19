package core

import (
	"github.com/joelson-c/vote-realtime/websocket"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/cmd"
	"github.com/pocketbase/pocketbase/tools/hook"
)

// ensures that the BaseRealtimeApp implements the RealtimeApp interface.
var _ RealtimeApp = (*BaseRealtimeApp)(nil)

type BaseRealtimeApp struct {
	*pocketbase.PocketBase

	hideStartBanner bool
	websocketBroker *websocket.Broker

	// Websocket Hooks
	onWebsocketConnected *hook.Hook[*WebsocketEvent]
	onWebsocketClosed    *hook.Hook[*WebsocketEvent]
	onWebsocketMessage   *hook.Hook[*WebsocketMessageEvent]
}

func NewRealtimeApp() *BaseRealtimeApp {
	app := &BaseRealtimeApp{
		PocketBase:      pocketbase.New(),
		websocketBroker: websocket.NewBroker(),
	}

	app.onWebsocketConnected = new(hook.Hook[*WebsocketEvent])
	app.onWebsocketClosed = new(hook.Hook[*WebsocketEvent])
	app.onWebsocketMessage = new(hook.Hook[*WebsocketMessageEvent])

	return app
}

func (app *BaseRealtimeApp) WebsocketBroker() *websocket.Broker {
	return app.websocketBroker
}

func (app *BaseRealtimeApp) OnWebsocketConnected() *hook.Hook[*WebsocketEvent] {
	return app.onWebsocketConnected
}

func (app *BaseRealtimeApp) OnWebsocketClosed() *hook.Hook[*WebsocketEvent] {
	return app.onWebsocketClosed
}

func (app *BaseRealtimeApp) OnWebsocketMessage() *hook.Hook[*WebsocketMessageEvent] {
	return app.onWebsocketMessage
}

func (app *BaseRealtimeApp) Start() error {
	app.RootCmd.AddCommand(cmd.NewSuperuserCommand(app))
	app.RootCmd.AddCommand(cmd.NewServeCommand(app, !app.hideStartBanner))

	return app.Execute()
}
