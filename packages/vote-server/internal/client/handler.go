package client

import (
	"sync"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type Handler struct {
	application.ClientHandler

	clients sync.Map
}

func NewHandler() application.ClientHandler {
	return &Handler{}
}

func (h *Handler) Register(c application.Client) error {
	h.clients.Store(c.Id(), c)
	return nil
}

func (h *Handler) Unregister(c application.Client) error {
	h.clients.Delete(c.Id())
	return nil
}

func (h *Handler) GetById(id string) (application.Client, bool) {
	v, ok := h.clients.Load(id)
	if !ok {
		return nil, false
	}

	return v.(application.Client), true
}
