package apis

import (
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/gorilla/websocket"
	realtimeCore "github.com/joelson-c/vote-realtime/core"
	"github.com/joelson-c/vote-realtime/models"
	realtimeSocket "github.com/joelson-c/vote-realtime/websocket"
	"github.com/pocketbase/pocketbase/core"
	"golang.org/x/sync/errgroup"
)

const CloseUserKickedFromRoom = 4000

type KickUserPayload struct {
	TargetUser string `json:"targetUser"`
}

type RealtimeUserPayload struct {
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
	HasVoted bool   `json:"hasVoted"`
	Observer bool   `json:"observer"`
}

type RemovedUserPayload struct {
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
}

func BindUserRealtimeHooks(app realtimeCore.RealtimeApp) {
	app.OnWebsocketConnected().BindFunc(func(e *realtimeCore.WebsocketEvent) error {
		user := getSocketUser(e)
		payload, err := json.Marshal(RealtimeUserPayload{
			Id:       user.Id,
			Nickname: user.GetString("nickname"),
			HasVoted: user.GetString("vote") != "",
			Observer: user.GetBool("observer"),
		})

		if err != nil {
			return err
		}

		connectionMessage := &realtimeSocket.Message{
			Name: "WS_USER_CONNECTED",
			Data: json.RawMessage(payload),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			connectionMessage,
			e.Client.Subscription(),
			WebsocketChunkSize,
		)

		return e.Next()
	})

	app.OnWebsocketClosed().BindFunc(func(e *realtimeCore.WebsocketEvent) error {
		user := getSocketUser(e)
		connectionMessage := &realtimeSocket.Message{
			Name: "WS_USER_DISCONNECTED",
			Data: json.RawMessage(`{"userId": "` + user.Id + `"}`),
		}

		e.App.WebsocketBroker().BroadcastMessage(
			connectionMessage,
			e.Client.Subscription(),
			WebsocketChunkSize,
			e.Client.Id(),
		)

		return e.Next()
	})

	app.OnRecordAfterUpdateSuccess(models.CollectionNameVoteUsers).BindFunc(func(e *core.RecordEvent) error {
		realtimeApp := app
		err := updateSocketAuthState(realtimeApp, e.Record)
		if err != nil {
			app.Logger().Warn(
				"Failed to update client(s) associated to the updated auth record",
				slog.Any("id", e.Record.Id),
				slog.String("collectionName", e.Record.Collection().Name),
				slog.String("error", err.Error()),
			)
		}

		payload, err := json.Marshal(RealtimeUserPayload{
			Id:       e.Record.Id,
			Nickname: e.Record.GetString("nickname"),
			HasVoted: e.Record.GetString("vote") != "",
			Observer: e.Record.GetBool("observer"),
		})

		if err != nil {
			return err
		}

		realtimeApp.WebsocketBroker().BroadcastMessage(
			&realtimeSocket.Message{
				Name: "WS_USER_UPDATED",
				Data: json.RawMessage(payload),
			},
			e.Record.GetString("room"),
			WebsocketChunkSize,
		)

		return e.Next()
	})

	app.OnRecordAfterDeleteSuccess(models.CollectionNameVoteUsers).BindFunc(func(e *core.RecordEvent) error {
		realtimeApp := app
		err := unsetSocketAuthState(realtimeApp, e.Record)
		if err != nil {
			app.Logger().Warn(
				"Failed to remove client(s) associated to the deleted auth model",
				slog.Any("id", e.Record.PK()),
				slog.String("collectionName", e.Record.TableName()),
				slog.String("error", err.Error()),
			)
		}

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
			e.Client.Send(&realtimeSocket.Message{
				Name: e.Message.Name + "_ERROR",
				Data: json.RawMessage(`{"error": "` + err.Error() + `"}`),
			})

			return err
		}

		if targetUser.GetString("room") != user.GetString("room") {
			e.Client.Send(&realtimeSocket.Message{
				Name: e.Message.Name + "_ERROR",
				Data: json.RawMessage(`{"error": "Target user is not in the room you're in."}`),
			})
		}

		clientChunks := e.App.WebsocketBroker().GetChunkedClientsBySubscription(e.Client.Subscription(), WebsocketChunkSize)
		for _, chunk := range clientChunks {
			for _, client := range chunk {
				clientAuth := client.Get(WebsocketClientAuthKey).(*core.Record)
				if clientAuth.Id == targetUser.Id {
					client.Discard(websocket.FormatCloseMessage(CloseUserKickedFromRoom, "User was kicked from the room"))
				}
			}
		}

		msgPayload, err := json.Marshal(RemovedUserPayload{
			Id:       targetUser.Id,
			Nickname: targetUser.GetString("nickname"),
		})

		if err != nil {
			return err
		}

		e.App.WebsocketBroker().BroadcastMessage(
			&realtimeSocket.Message{
				Name: "WS_USER_REMOVED",
				Data: json.RawMessage(msgPayload),
			},
			targetUser.GetString("room"),
			WebsocketChunkSize,
		)

		e.App.Logger().Info(
			"Removed user from room",
			slog.String("room", user.GetString("room")),
			slog.String("requester", user.Id),
			slog.String("targetUser", targetUser.Id),
		)

		return e.Next()
	})
}

func updateSocketAuthState(app realtimeCore.RealtimeApp, newRecord *core.Record) error {
	client, err := getSocketUserByRecord(app, newRecord)
	if err != nil {
		return err
	}

	client.Set(WebsocketClientAuthKey, newRecord)
	return nil
}

func unsetSocketAuthState(app realtimeCore.RealtimeApp, newRecord *core.Record) error {
	client, err := getSocketUserByRecord(app, newRecord)
	if err != nil {
		return err
	}

	client.Unset(WebsocketClientAuthKey)
	return nil
}

func getSocketUserByRecord(app realtimeCore.RealtimeApp, record *core.Record) (realtimeSocket.Client, error) {
	clientChunks := app.WebsocketBroker().GetChunkedClientsBySubscription(record.GetString("room"), WebsocketChunkSize)
	group := new(errgroup.Group)
	clientChan := make(chan realtimeSocket.Client)

	for _, chunk := range clientChunks {
		group.Go(func() error {
			for _, client := range chunk {
				clientAuth, _ := client.Get(WebsocketClientAuthKey).(*core.Record)
				if clientAuth != nil &&
					clientAuth.Id == record.Id &&
					clientAuth.Collection().Name == record.Collection().Name {
					clientChan <- client
				}
			}

			return nil
		})
	}

	return <-clientChan, nil
}
