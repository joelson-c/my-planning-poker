package apis

import (
	"fmt"
	"log/slog"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/joelson-c/vote-realtime/room"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func BindRoomRealtimeHooks(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		server := room.ServerFromAppStore(se.App)
		server.OnClientConnected().BindFunc(func(ce *room.ClientEvent) error {
			se.App.Logger().Debug("Connection estabilished with client", slog.String("client", ce.Client.Id))
			ce.Client.Room.Broadcast() <- room.NewMessageWithData(room.UserConnectedMessage,
				&room.UserConnected{
					Id: ce.Client.Id,
				},
			)
			return nil
		})

		server.OnClientDisconnected().BindFunc(func(ce *room.ClientEvent) error {
			se.App.Logger().Debug("Connection closed for client", slog.String("client", ce.Client.Id))
			ce.Client.Room.Broadcast() <- room.NewMessageWithData(
				room.UserDisconnectedMessage,
				&room.UserConnected{
					Id: ce.Client.Id,
				},
			)

			return nil
		})

		sub := se.Router.Group("/api/ws").
			Bind(apis.SkipSuccessActivityLog()).
			Bind(RequireWebsocketAuth())

		sub.GET("/room", roomWebsocketHandler)

		app.OnRecordAfterCreateSuccess(models.CollectionNameVoteRooms).BindFunc(afterRoomCreated)
		app.OnRecordAfterDeleteSuccess(models.CollectionNameVoteRooms).BindFunc(afterRoomDeleted)

		return se.Next()
	})
}

func afterRoomCreated(e *core.RecordEvent) error {
	server := room.ServerFromAppStore(e.App)
	server.CreateRoom(e.Record.Id)
	return e.Next()
}

func afterRoomDeleted(e *core.RecordEvent) error {
	server := room.ServerFromAppStore(e.App)
	server.CloseRoom(e.Record.Id)
	return e.Next()
}

func roomWebsocketHandler(e *core.RequestEvent) error {
	server := room.ServerFromAppStore(e.App)
	roomId := e.Auth.GetString("room")
	serverRoom, ok := server.GetRoomById(roomId)
	if !ok {
		serverRoom = server.CreateRoom(roomId)
	}

	client, err := room.ServeWs(server, e.Auth.Id, e.Response, e.Request)
	if err != nil {
		return err
	}

	client.JoinRoom(serverRoom)

	// TODO: implement pub/sub broker (redis or other solution)
	client.OnIncomingMessage(room.RoomRevealMessage, room.RoomResetMessage).BindFunc(func(me *room.MessageEvent) error {
		return onStateMessage(me, e.App)
	})

	client.OnIncomingMessage(room.UserKickMessage).BindFunc(func(me *room.MessageEvent) error {
		return onKickUser(me, e.App)
	})

	return e.Next()
}

func onStateMessage(e *room.MessageEvent, app core.App) error {
	roomId := e.Client.Room.Id
	roomRecord, err := app.FindRecordById(models.CollectionNameVoteRooms, roomId)
	if err != nil {
		return fmt.Errorf("Failed to find room: %w", err)
	}

	var targetState string
	if e.Message.Name == room.RoomRevealMessage {
		targetState = models.VoteStateReveal
	} else {
		targetState = models.VoteStateVoting
	}

	sourceState := roomRecord.GetString("state")
	if sourceState == targetState {
		app.Logger().Debug(
			"Trying to change room state to the same state",
			slog.String("room", roomRecord.Id),
			slog.String("targetState", targetState),
		)

		return e.Next()
	}

	roomRecord.Set("state", targetState)
	if err := app.Save(roomRecord); err != nil {
		e.Client.SendMessage() <- room.NewMessageWithData(
			room.GenericErrorMessage,
			&room.GenericError{
				Error: err.Error(),
			},
		)

		return err
	}

	app.Logger().Info(
		"Changed room state",
		slog.String("room", roomRecord.Id),
		slog.String("sourceState", sourceState),
		slog.String("targetState", targetState),
	)

	if targetState == models.VoteStateVoting {
		if err := resetRoomVotes(roomRecord, app); err != nil {
			e.Client.SendMessage() <- room.NewMessageWithData(
				room.GenericErrorMessage,
				&room.GenericError{
					Error: err.Error(),
				},
			)

			return err
		}
	}

	e.Client.Room.Broadcast() <- e.Message

	return e.Next()
}

func resetRoomVotes(room *core.Record, app core.App) error {
	app.Logger().Info(
		"Resetting votes for room",
		"room", room.Id,
	)

	roomUsers, err := app.FindAllRecords(
		"voteUsers",
		dbx.NewExp("room={:room}", dbx.Params{"room": room.Id}),
		dbx.NewExp("vote != ''"),
	)

	if err != nil {
		return err
	}

	return app.RunInTransaction(func(txApp core.App) error {
		for _, user := range roomUsers {
			user.Set("vote", nil)

			if err := txApp.Save(user); err != nil {
				return err
			}
		}

		return nil
	})
}
