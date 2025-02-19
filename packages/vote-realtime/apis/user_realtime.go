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

func BindUserRealtimeHooks(app realtimeCore.RealtimeApp) {
	app.OnRecordAfterUpdateSuccess(models.CollectionNameVoteUsers).BindFunc(func(e *core.RecordEvent) error {
		realtimeApp := e.App.(realtimeCore.RealtimeApp)
		err := updateSocketAuthState(realtimeApp, e.Record)
		if err != nil {
			app.Logger().Warn(
				"Failed to update client(s) associated to the updated auth record",
				slog.Any("id", e.Record.Id),
				slog.String("collectionName", e.Record.Collection().Name),
				slog.String("error", err.Error()),
			)
		}

		realtimeApp.WebsocketBroker().BroadcastMessage(
			&realtimeSocket.Message{
				Name: "WS_USER_UPDATED",
				Data: json.RawMessage(`{"userId": "` + e.Record.Id + `"}`),
			},
			e.Record.GetString("room"),
			WebsocketChunkSize,
		)

		return e.Next()
	})

	app.OnRecordAfterDeleteSuccess(models.CollectionNameVoteUsers).BindFunc(func(e *core.RecordEvent) error {
		realtimeApp := e.App.(realtimeCore.RealtimeApp)
		err := unsetSocketAuthState(realtimeApp, e.Record)
		if err != nil {
			app.Logger().Warn(
				"Failed to remove client(s) associated to the deleted auth model",
				slog.Any("id", e.Record.PK()),
				slog.String("collectionName", e.Record.TableName()),
				slog.String("error", err.Error()),
			)
		}

		realtimeApp.WebsocketBroker().BroadcastMessage(
			&realtimeSocket.Message{
				Name: "WS_USER_UPDATED",
				Data: json.RawMessage(`{"userId": "` + e.Record.Id + `"}`),
			},
			e.Record.GetString("room"),
			WebsocketChunkSize,
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
	clientChunks := app.WebsocketBroker().GetChunkedClientsBySubscription(newRecord.GetString("room"), WebsocketChunkSize)
	group := new(errgroup.Group)
	for _, chunk := range clientChunks {
		group.Go(func() error {
			for _, client := range chunk {
				clientAuth, _ := client.Get(WebsocketClientAuthKey).(*core.Record)
				if clientAuth != nil &&
					clientAuth.Id == newRecord.Id &&
					clientAuth.Collection().Name == newRecord.Collection().Name {
					client.Set(WebsocketClientAuthKey, newRecord)
				}
			}

			return nil
		})
	}

	return group.Wait()
}

func unsetSocketAuthState(app realtimeCore.RealtimeApp, newRecord *core.Record) error {
	clientChunks := app.WebsocketBroker().GetChunkedClientsBySubscription(newRecord.GetString("room"), WebsocketChunkSize)
	group := new(errgroup.Group)
	for _, chunk := range clientChunks {
		group.Go(func() error {
			for _, client := range chunk {
				clientAuth, _ := client.Get(WebsocketClientAuthKey).(*core.Record)
				if clientAuth != nil &&
					clientAuth.Id == newRecord.Id &&
					clientAuth.Collection().Name == newRecord.Collection().Name {
					client.Unset(WebsocketClientAuthKey)
				}
			}

			return nil
		})
	}

	return group.Wait()
}
