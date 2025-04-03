package message

import (
	"fmt"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

func handleStatusChangeMessage(d *application.MessageHandlerData) error {
	room, ok := d.App.RoomHandler().GetById(d.Session.RoomId)
	if !ok {
		return fmt.Errorf("room status: unable to get active room for voting")
	}

	if d.Msg.Type == models.RevealMessage {
		if room.IsRevealed {
			return fmt.Errorf("room status: room is already in reveal state")
		}

		room.IsRevealed = true
	} else if d.Msg.Type == models.ResetMessage {
		if !room.IsRevealed {
			return fmt.Errorf("room status: room is already in voting state")
		}

		room.IsRevealed = false
	} else {
		return fmt.Errorf("room status: unknown message type '%d'", d.Msg.Type)
	}

	if err := d.App.RoomHandler().Save(room); err != nil {
		return err
	}

	return d.App.BroadcastHandler().BroadcastForRoom(room, d.Msg)
}
