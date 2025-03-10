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
	server := room.ServerFromAppStore(app)
	server.OnIncomingMessage(room.UserKickMessage).BindFunc(func(e *room.MessageEvent) error {
		return onKickUser(e, app)
	})

	server.OnClientConnected().BindFunc(func(ce *room.ClientEvent) error {
		return onUserConnected(ce, app)
	})

	server.OnClientDisconnected().BindFunc(func(ce *room.ClientEvent) error {
		return onUserDisconnected(ce, app)
	})

	app.OnRecordAfterUpdateSuccess(models.CollectionNameVoteUsers).BindFunc(afterUserUpdated)
	app.OnRecordAfterDeleteSuccess(models.CollectionNameVoteUsers).BindFunc(afterUserDeleted)
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

	if targetUser.Id == e.Client.Id {
		err = fmt.Errorf("Trying to kick self")
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

	if targetUser.GetBool("active") {
		targetUser.Set("active", false)
		if err := app.Save(targetUser); err != nil {
			return fmt.Errorf("Failed to inactivate target user: %v", err)
		}
	}

	targetClient := e.Client.Room.GetClientById(targetUser.Id)
	if targetClient == nil {
		return fmt.Errorf("Failed to find target client")
	}

	targetClient.DisconnectWithMessage(
		websocket.FormatCloseMessage(CloseUserKickedFromRoom, "User was kicked from the room"),
	)

	e.Client.Room.Broadcast() <- e.Message

	return e.Next()
}

func onUserConnected(e *room.ClientEvent, app core.App) error {
	app.Logger().Debug("Connection estabilished with client", slog.String("client", e.Client.Id))

	e.Client.Record.Set("active", true)
	if err := app.UnsafeWithoutHooks().Save(e.Client.Record); err != nil {
		e.Client.DisconnectWithMessage(
			websocket.FormatCloseMessage(websocket.CloseInternalServerErr, "Failed to update user record"),
		)

		return fmt.Errorf("Failed to update user record after client connection: %v", err)
	}

	e.Client.Room.Broadcast() <- room.NewMessageWithData(room.UserConnectedMessage,
		&room.UserConnection{
			Id:       e.Client.Id,
			Nickname: e.Client.Record.GetString("nickname"),
			Observer: e.Client.Record.GetBool("observer"),
		},
	)
	return e.Next()
}

func onUserDisconnected(e *room.ClientEvent, app core.App) error {
	app.Logger().Debug("Connection closed for client", slog.String("client", e.Client.Id))

	e.Client.Record.Set("active", false)
	if err := app.UnsafeWithoutHooks().Save(e.Client.Record); err != nil {
		return fmt.Errorf("Failed to update user record after client disconnection: %v", err)
	}

	e.Client.Room.Broadcast() <- room.NewMessageWithData(
		room.UserDisconnectedMessage,
		&room.UserConnection{
			Id:       e.Client.Id,
			Nickname: e.Client.Record.GetString("nickname"),
			Observer: e.Client.Record.GetBool("observer"),
		},
	)

	return e.Next()
}
