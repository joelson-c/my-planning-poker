package main

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
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
		if !isOwnerOfRecord {
			e.Record.Hide("vote")
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/room-auth", func(e *core.RequestEvent) error {
			data := struct {
				Room     string `json:"room"     form:"room"`
				Nickname string `json:"nickname" form:"nickname"`
				Password string `json:"password" form:"password"`
			}{}

			if err := e.BindBody(&data); err != nil {
				return e.BadRequestError("Failed to read request data", err)
			}

			record, err := e.App.FindFirstRecordByFilter(
				"vote_users",
				"room={:room} && nickname={:nickname}",
				dbx.Params{"room": data.Room, "nickname": data.Nickname},
			)

			if err != nil || !record.ValidatePassword(data.Password) {
				// return generic 400 error as a basic enumeration protection
				return e.BadRequestError("Invalid credentials", err)
			}

			return apis.RecordAuthResponse(e, record, "room", nil)
		})

		return se.Next()
	})
}
