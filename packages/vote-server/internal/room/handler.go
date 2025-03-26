package room

import (
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

func (h *Handler) Create(r application.Room) error {
	return nil
}

func (h *Handler) Delete(r application.Room) error {
	return nil
}
func (h *Handler) GetById(id string) (application.Room, bool) {
	return nil, false
}

func (h *Handler) Exists(id string) bool {
	return false
}
