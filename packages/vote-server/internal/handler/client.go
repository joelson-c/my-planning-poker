package handler

import (
	"sync"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
	"github.com/redis/go-redis/v9"
)

type Client struct {
	application.ClientHandler

	clients sync.Map
	redis   *redis.Client
}

func NewClient(redis *redis.Client) application.ClientHandler {
	return &Client{
		redis: redis,
	}
}

func (h *Client) Register(c *models.Client) error {
	h.clients.Store(c.Id, c)
	return nil
}

func (h *Client) Unregister(c *models.Client) error {
	h.clients.Delete(c.Id)
	return nil
}

func (h *Client) GetById(id string) (*models.Client, bool) {
	v, ok := h.clients.Load(id)
	if !ok {
		return nil, false
	}

	return v.(*models.Client), true
}
