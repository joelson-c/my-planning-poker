package apis

import (
	"fmt"
	"log/slog"

	"github.com/gorilla/websocket"
	"github.com/joelson-c/vote-realtime/models"
	"github.com/joelson-c/vote-realtime/room"
	"github.com/pocketbase/pocketbase/core"
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

func BindUserRealtimeHooks(app core.App) {
	app.OnRecordAfterUpdateSuccess(models.CollectionNameVoteUsers).BindFunc(afterUserUpdated)
	app.OnRecordAfterDeleteSuccess(models.CollectionNameVoteUsers).BindFunc(afterUserDeleted)

	/* payload := &KickUserPayload{}
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

		return fmt.Errorf("Trying to kick a user from a different room")
	}

	if !targetUser.GetBool("active") {
		e.Client.Send(&realtimeSocket.Message{
			Name: e.Message.Name + "_ERROR",
			Data: json.RawMessage(`{"error": "Target user is not active"}`),
		})

		return fmt.Errorf("Target user is not active")
	}

	client, _ := getSocketUserByRecord(app, targetUser)
	if client != nil {
		client.Connection().WriteMessage(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(CloseUserKickedFromRoom, "User was kicked from the room"),
		)

		app.WebsocketBroker().Unregister(client.Id())
	}

	if client == nil {
		// The user is not connected to the websocket, but still appears in the room user list
		targetUser.Set("active", false)
		if err := e.App.Save(targetUser); err != nil {
			return err
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
	) */
}

func afterUserUpdated(e *core.RecordEvent) error {
	server := room.ServerFromAppStore(e.App)
	roomId := e.Record.GetString("room")
	serverRoom, ok := server.GetRoomById(roomId)
	if !ok {
		e.App.Logger().Debug("Discarding update event for user in non-existent room", slog.String("room", roomId))
		return e.Next()
	}

	serverRoom.Broadcast() <- room.NewMessageWithData(room.UserUpdatedMessage, &room.UserUpdated{
		Id:       e.Record.Id,
		Nickname: e.Record.GetString("nickname"),
		HasVoted: e.Record.GetString("vote") != "",
		Observer: e.Record.GetBool("observer"),
	})

	return e.Next()
}

func afterUserDeleted(e *core.RecordEvent) error {
	server := room.ServerFromAppStore(e.App)
	roomId := e.Record.GetString("room")
	serverRoom, ok := server.GetRoomById(roomId)
	if !ok {
		e.App.Logger().Debug("Discarding delete event for user in non-existent room", slog.String("room", roomId))
		return e.Next()
	}

	client := serverRoom.GetClientById(e.Record.Id)
	if client != nil {
		client.DisconnectWithMessage(websocket.FormatCloseMessage(CloseUserKickedFromRoom, "User was kicked from the room"))
	}

	return e.Next()
}

func onKickUser(e *room.MessageEvent, app core.App) error {
	var msgData room.UserKick
	e.Message.DecodeData(&msgData)

	targetUser, err := app.FindRecordById(models.CollectionNameVoteUsers, msgData.Target)
	if err != nil {
		err = fmt.Errorf("Failed to find target user")

		e.Client.SendMessage() <- room.NewMessageWithData(
			room.GenericErrorMessage,
			&room.GenericError{Error: err.Error()},
		)

		return err
	}

	if targetUser.GetString("room") != e.Client.Room.Id {
		err = fmt.Errorf("Trying to kick a user from a different room")
		e.Client.SendMessage() <- room.NewMessageWithData(
			room.GenericErrorMessage,
			&room.GenericError{Error: err.Error()},
		)

		return err
	}

	if !targetUser.GetBool("active") {
		err = fmt.Errorf("Target user is not active")

		e.Client.SendMessage() <- room.NewMessageWithData(
			room.GenericErrorMessage,
			&room.GenericError{Error: err.Error()},
		)

		return err
	}

	if err := app.Delete(targetUser); err != nil {
		return fmt.Errorf("Failed to delete target user: %v", err)
	}

	e.Client.Room.Broadcast() <- e.Message

	return e.Next()
}
