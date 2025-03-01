package apis

import (
	"encoding/json"
	"log/slog"

	realtimeCore "github.com/joelson-c/vote-realtime/core"
	"github.com/joelson-c/vote-realtime/models"
	"github.com/joelson-c/vote-realtime/websocket"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func BindRoomRealtimeHooks(app realtimeCore.RealtimeApp) {
	app.OnWebsocketMessage("WS_REVEAL", "WS_RESET").BindFunc(func(e *realtimeCore.WebsocketMessageEvent) error {
		room, err := e.App.FindRecordById(models.CollectionNameVoteRooms, e.Client.Subscription())
		if err != nil {
			return err
		}

		var targetState string
		if e.Message.Name == "WS_REVEAL" {
			targetState = models.VoteStateReveal
		} else {
			targetState = models.VoteStateVoting
		}

		sourceState := room.GetString("state")
		if sourceState == targetState {
			e.App.Logger().Debug(
				"Trying to change room state to the same state",
				slog.String("room", room.Id),
				slog.String("targetState", targetState),
			)

			return e.Next()
		}

		room.Set("state", targetState)
		if err := e.App.Save(room); err != nil {
			e.Client.Send(&websocket.Message{
				Name: e.Message.Name + "_ERROR",
				Data: json.RawMessage(`{"error": "` + err.Error() + `"}`),
			})

			return err
		}

		e.App.Logger().Info(
			"Changed room state",
			slog.String("room", room.Id),
			slog.String("sourceState", sourceState),
			slog.String("targetState", targetState),
		)

		if targetState == models.VoteStateVoting {
			if err := resetRoomVotes(e, room); err != nil {
				e.Client.Send(&websocket.Message{
					Name: e.Message.Name + "_ERROR",
					Data: json.RawMessage(`{"error": "` + err.Error() + `"}`),
				})

				return err
			}
		}

		roomStateMessage := &websocket.Message{
			Name: "WS_ROOM_STATE_CHANGED",
			Data: json.RawMessage(`{"state": "` + room.GetString("state") + `"}`),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			roomStateMessage,
			e.Client.Subscription(),
			WebsocketChunkSize,
		)

		return e.Next()
	})
}

func resetRoomVotes(e *realtimeCore.WebsocketMessageEvent, room *core.Record) error {
	e.App.Logger().Info(
		"Resetting votes for room",
		"room", room.Id,
	)

	roomUsers, err := e.App.FindAllRecords(
		"voteUsers",
		dbx.NewExp("room={:room}", dbx.Params{"room": room.Id}),
		dbx.NewExp("vote != ''"),
	)

	if err != nil {
		return err
	}

	return e.App.RunInTransaction(func(txApp core.App) error {
		for _, user := range roomUsers {
			user.Set("vote", nil)

			if err := txApp.Save(user); err != nil {
				return err
			}
		}

		return nil
	})
}
