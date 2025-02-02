package apis

import (
	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/pocketbase/core"
)

func BindUserEvents(app core.App) {
	app.OnRecordEnrich(models.CollectionNameVoteUsers).BindFunc(func(e *core.RecordEnrichEvent) error {
		return onRecordEnrich(e)
	})
}

func onRecordEnrich(e *core.RecordEnrichEvent) error {
	var voteValue = e.Record.GetString("vote")
	e.Record.WithCustomData(true)
	e.Record.Set("hasVoted", voteValue != "")
	e.Record.Hide("vote")

	authRecord := e.RequestInfo.Auth
	if authRecord == nil || authRecord.Collection().Name != models.CollectionNameVoteUsers {
		return e.Next()
	}

	isOwnerOfRecord := authRecord.Id == e.Record.GetString("id")
	if isOwnerOfRecord {
		e.Record.Unhide("vote")
		return e.Next()
	}

	userRoom, err := e.App.FindRecordById(models.CollectionNameVoteRooms, e.Record.GetString("room"))
	if err != nil {
		e.App.Logger().Warn("Failed to find room for user", "error", err)
		return e.Next()
	}

	if userRoom.GetString("state") == "REVEAL" {
		e.App.Logger().Debug(
			"Showing votes for room with REVEAL state",
			"room", e.Record.Id,
		)

		e.Record.Unhide("vote")
	}

	return e.Next()
}
