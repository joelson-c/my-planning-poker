package apis

import (
	"encoding/json"
	"fmt"
	"log/slog"

	realtimeCore "github.com/joelson-c/vote-realtime/core"
	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

const socketChunkSize = 16

type KickUserPayload struct {
	TargetUser string `json:"targetUser"`
}

func BindRoomRealtimeHooks(app realtimeCore.RealtimeApp) {
	app.OnWebsocketConnected().BindFunc(func(e *realtimeCore.WebsocketEvent) error {
		user := getSocketUser(e)
		connectionMessage := &subscriptions.Message{
			Name: "WS_USER_CONNECTED",
			Data: []byte(user.Id),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			connectionMessage,
			e.Client.Subscription(),
			socketChunkSize,
		)

		return e.Next()
	})

	app.OnWebsocketClosed().BindFunc(func(e *realtimeCore.WebsocketEvent) error {
		user := getSocketUser(e)
		connectionMessage := &subscriptions.Message{
			Name: "WS_USER_DISCONNECTED",
			Data: []byte(user.Id),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			connectionMessage,
			e.Client.Subscription(),
			socketChunkSize,
			e.Client.Id(),
		)

		return e.Next()
	})

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
			e.Client.Send(&subscriptions.Message{
				Name: e.Message.Name + "_ERROR",
				Data: []byte("Failed to save the new room state"),
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
				e.Client.Send(&subscriptions.Message{
					Name: e.Message.Name + "_ERROR",
					Data: []byte("Failed to clear room votes"),
				})

				return err
			}
		}

		roomStateMessage := &subscriptions.Message{
			Name: "WS_ROOM_STATE_CHANGED",
			Data: []byte(room.GetString("state")),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			roomStateMessage,
			e.Client.Subscription(),
			socketChunkSize,
		)

		return e.Next()
	})

	app.OnWebsocketMessage("WS_KICK_USR").BindFunc(func(e *realtimeCore.WebsocketMessageEvent) error {
		payload := &KickUserPayload{}
		err := json.Unmarshal(e.Message.Data, payload)
		if err != nil {
			return err
		}

		if payload.TargetUser == "" {
			return fmt.Errorf("Missing target user in payload")
		}

		user := e.Client.Get(WebsocketClientAuthKey).(*core.Record)
		if payload.TargetUser == user.Id {
			return fmt.Errorf("Cannot kick yourself")
		}

		targetUser, err := e.App.FindRecordById(models.CollectionNameVoteUsers, payload.TargetUser)
		if err != nil {
			e.Client.Send(&subscriptions.Message{
				Name: e.Message.Name + "_ERROR",
				Data: []byte("The target user was not found"),
			})

			return err
		}

		if targetUser.GetString("room") != user.GetString("room") {
			e.Client.Send(&subscriptions.Message{
				Name: e.Message.Name + "_ERROR",
				Data: []byte("The target user is not in the same room"),
			})
		}

		clientChunks := e.App.WebsocketBroker().GetChunkedClientsBySubscription(e.Client.Subscription(), socketChunkSize)
		for _, chunk := range clientChunks {
			for _, client := range chunk {
				clientAuth := client.Get(WebsocketClientAuthKey).(*core.Record)
				if clientAuth.Id == targetUser.Id {
					client.Send(&subscriptions.Message{
						Name: "WS_FORCE_DISCONNECT",
					})

					client.Discard()
				}
			}
		}

		e.App.Logger().Info(
			"Removed user from room",
			slog.String("room", user.GetString("room")),
			slog.String("requester", user.Id),
			slog.String("targetUser", targetUser.Id),
		)

		return e.Next()
	})
}

func getSocketUser(e *realtimeCore.WebsocketEvent) *core.Record {
	return e.Client.Get(WebsocketClientAuthKey).(*core.Record)
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
