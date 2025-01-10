package main

import (
	"database/sql"
	"errors"

	"github.com/joelson-c/vote-realtime/apis"
	"github.com/pocketbase/pocketbase/core"
)

func bindHooks(app core.App) {
	app.OnRecordEnrich("voteUsers").BindFunc(func(e *core.RecordEnrichEvent) error {
		var voteValue = e.Record.GetString("vote")
		e.Record.WithCustomData(true)
		e.Record.Set("hasVoted", voteValue != "")
		e.Record.Hide("vote")

		if e.RequestInfo.Auth == nil || e.RequestInfo.Auth.Collection().Name != "voteUsers" {
			return e.Next()
		}

		isOwnerOfRecord := e.RequestInfo.Auth.Id == e.Record.GetString("id")
		if isOwnerOfRecord {
			e.Record.Unhide("vote")
			return e.Next()
		}

		userRoom, err := app.FindRecordById("voteRooms", e.Record.GetString("room"))
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		if userRoom != nil && userRoom.GetString("state") == "REVEAL" {
			app.Logger().Debug(
				"Showing votes for room with REVEAL state",
				"room", e.Record.Id,
			)

			e.Record.Unhide("vote")
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		apiGroup := se.Router.Group("/api/vote")
		apis.BindRoomApis(app, apiGroup)
		return se.Next()
	})
}
