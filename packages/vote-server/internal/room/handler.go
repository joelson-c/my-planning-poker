package room

import (
	"context"
	"fmt"
	"log"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type Handler struct {
	application.RoomHandler

	appCtx *application.AppContext
}

func NewHandler(ctx *application.AppContext) application.RoomHandler {
	return &Handler{
		appCtx: ctx,
	}
}

func (h *Handler) Save(r *application.Room) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.HSet(ctx, h.keyFromRoom(r), r)
	return cmd.Err()
}

func (h *Handler) Delete(r *application.Room) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.Del(ctx, h.keyFromRoom(r))
	return cmd.Err()
}
func (h *Handler) GetById(id string) (*application.Room, bool) {
	ctx := context.Background()
	cmd := h.appCtx.Redis.HGetAll(ctx, h.keyFromId(id))

	var room application.Room
	if err := cmd.Scan(&room); err != nil {
		log.Printf("room: unable to get by id: %v", err)
		return nil, false
	}

	if room.Id == "" {
		return nil, false
	}

	return &room, true
}

func (h *Handler) keyFromId(id string) string {
	return fmt.Sprintf("room:%s", id)
}

func (h *Handler) keyFromRoom(s *application.Room) string {
	return fmt.Sprintf("room:%s", s.Id)
}
