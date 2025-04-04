package handler

import (
	"context"
	"fmt"
	"log"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
	"github.com/redis/go-redis/v9"
)

type Room struct {
	application.RoomHandler

	redis *redis.Client
}

func NewRoom(redis *redis.Client) application.RoomHandler {
	return &Room{
		redis: redis,
	}
}

func (h *Room) Save(r *models.Room) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := h.redis.HSet(ctx, h.keyFromId(r.Id), r)
	return cmd.Err()
}

func (h *Room) Delete(r *models.Room) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := h.redis.Unlink(ctx, h.keyFromId(r.Id))
	return cmd.Err()
}
func (h *Room) GetById(id string) (*models.Room, bool) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := h.redis.HGetAll(ctx, h.keyFromId(id))

	room := new(models.Room)
	if err := cmd.Scan(room); err != nil {
		log.Printf("room: unable to get by id: %v", err)
		return nil, false
	}

	if room.Id == "" {
		return nil, false
	}

	return room, true
}

func (h *Room) RegisterClient(r *models.Room, c *models.Client) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := h.redis.SAdd(ctx, h.keyForClients(r.Id), c.Id)
	return cmd.Err()
}

func (h *Room) UnregisterClient(r *models.Room, c *models.Client) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cmd := h.redis.SRem(ctx, h.keyForClients(r.Id), c.Id)
	return cmd.Err()
}

func (h *Room) GetClientIds(r *models.Room) ([]string, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ids, err := h.redis.SMembers(ctx, h.keyForClients(r.Id)).Result()
	if err != nil {
		return nil, err
	}

	return ids, nil
}

func (h *Room) keyFromId(id string) string {
	return fmt.Sprintf("room:%s", id)
}

func (h *Room) keyForClients(id string) string {
	return fmt.Sprintf("room:%s:clients", id)
}
