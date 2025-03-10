package main

import (
	"github.com/joelson-c/vote-realtime/apis"
	"github.com/pocketbase/pocketbase/core"
)

func bindAppHooks(app core.App) {
	apis.BindRoomRealtimeHooks(app)
	apis.BindUserRealtimeHooks(app)
	apis.BindRoomHooks(app)
	apis.BindUserEvents(app)
	apis.BindPruneHooks(app)
}
