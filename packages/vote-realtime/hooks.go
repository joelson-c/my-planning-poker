package main

import (
	"github.com/joelson-c/vote-realtime/apis"
	"github.com/pocketbase/pocketbase/core"
)

func bindHooks(app core.App) {
	apis.BindUserEvents(app)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		apiGroup := se.Router.Group("/api/vote")
		apis.BindRoomApis(apiGroup)
		apis.BindHeartbeatApis(apiGroup)
		return se.Next()
	})

	app.Cron().MustAdd("pruneStaleRoomConnections", "* * * * *", func() {
		if err := apis.PruneStaleUserConnections(app); err != nil {
			app.Logger().Warn("Failed to delete stale room connections", "error", err)
		}
	})
}
