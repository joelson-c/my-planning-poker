package main

import (
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
}
