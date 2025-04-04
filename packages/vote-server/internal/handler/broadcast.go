package handler

import (
	"slices"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

const clientChunkSize = 16

type Broadcast struct {
	application.BroadcastHandler

	sessionHandler application.SessionHandler
	roomHandler    application.RoomHandler
	clientHandler  application.ClientHandler
}

func NewBroadcast(
	s application.SessionHandler,
	r application.RoomHandler,
	c application.ClientHandler,
) application.BroadcastHandler {
	return &Broadcast{
		sessionHandler: s,
		roomHandler:    r,
		clientHandler:  c,
	}
}

func (h *Broadcast) BroadcastForRoom(r *models.Room, m *models.Message) error {
	ids, err := h.roomHandler.GetClientIds(r)
	if err != nil {
		return err
	}

	for chunk := range slices.Chunk(ids, clientChunkSize) {
		go func() {
			for _, id := range chunk {
				client, ok := h.clientHandler.GetById(id)
				if !ok {
					continue
				}

				client.SendMessage(m)
			}
		}()
	}

	return nil
}
