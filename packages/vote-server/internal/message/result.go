package message

import (
	"fmt"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

func handleResultMessage(d *application.MessageHandlerData) error {
	room, ok := d.App.RoomHandler().GetById(d.Session.RoomId)
	if !ok {
		return fmt.Errorf("result: unable to get active room for voting")
	}

	if !room.IsRevealed {
		return fmt.Errorf("result: room is has not been revealed")
	}

	clientIds, err := d.App.RoomHandler().GetClientIds(room)
	if err != nil {
		return fmt.Errorf("result: unable to get room users: %v", err)
	}

	var sessions []*models.Session
	for _, clientId := range clientIds {
		client, ok := d.App.ClientHandler().GetById(clientId)
		if !ok {
			continue
		}

		session, ok := d.App.SessionHandler().GetById(client.SessionId)
		sessions = append(sessions, session)
	}

	result := models.NewResultForSessions(sessions)
	return d.App.BroadcastHandler().BroadcastForRoom(
		room,
		models.NewMessage(models.ResultMessage, result.ToMessage()),
	)
}
