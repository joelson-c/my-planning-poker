package main

import (
	"github.com/joelson-c/vote-realtime/apis"
	"github.com/joelson-c/vote-realtime/core"
)

func bindAppHooks(app core.RealtimeApp) {
	apis.BindWebsocketHooks(app)
	apis.BindRoomHooks(app)
}
