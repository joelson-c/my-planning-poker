package main

import (
	"database/sql"
	"errors"

	"github.com/joelson-c/vote-realtime/apis"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func bindHooks(app core.App) {
	app.OnRecordEnrich("vote_users").BindFunc(func(e *core.RecordEnrichEvent) error {
		if e.RequestInfo.Auth == nil || e.RequestInfo.Auth.Collection().Name != "vote_users" {
			e.Record.Hide("vote")
			return e.Next()
		}

		var voteValue = e.Record.GetString("vote")
		e.Record.WithCustomData(true)
		e.Record.Set("hasVoted", voteValue != "")

		var isOwnerOfRecord = e.RequestInfo.Auth.Id == e.Record.GetString("id")
		if userRoomId := e.Record.GetString("room"); userRoomId != "" {
			userRoom, err := app.FindRecordById("vote_rooms", userRoomId)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				return err
			}

			if userRoom.GetString("state") == "REVEAL" {
				app.Logger().Debug(
					"Showing votes for room with REVEAL state",
					"room", e.Record.Id,
				)

				return e.Next()
			}
		}

		if !isOwnerOfRecord {
			e.Record.Hide("vote")
		}

		return e.Next()
	})

	app.OnRecordUpdateRequest("vote_rooms").BindFunc(func(e *core.RecordRequestEvent) error {
		recordState := e.Record.GetString("state")
		originalRecordState := e.Record.Original().GetString("state")

		shouldResetVotes := recordState == "VOTING" && originalRecordState == "REVEAL"
		if !shouldResetVotes {
			return e.Next()
		}

		app.Logger().Info(
			"Resetting votes for room",
			"room", e.Record.Id,
			"newState", recordState,
			"oldState", originalRecordState,
		)

		roomUsers, err := app.FindAllRecords(
			"vote_users",
			dbx.NewExp("room={:room}", dbx.Params{"room": e.Record.Id}),
			dbx.NewExp("vote != ''"),
		)

		if err != nil {
			return err
		}

		app.RunInTransaction(func(txApp core.App) error {
			for _, user := range roomUsers {
				user.Set("vote", nil)

				if err := txApp.Save(user); err != nil {
					return err
				}
			}

			return nil
		})

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		apiGroup := se.Router.Group("/api/vote")

		apis.BindRoomApis(app, apiGroup)

		return se.Next()
	})
}
