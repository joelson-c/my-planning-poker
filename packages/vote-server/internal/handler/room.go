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
	ctx := context.Background()
	cmd := h.redis.HSet(ctx, h.keyFromRoom(r), r)
	return cmd.Err()
}

func (h *Room) Delete(r *models.Room) error {
	ctx := context.Background()
	cmd := h.redis.Unlink(ctx, h.keyFromRoom(r))
	return cmd.Err()
}
func (h *Room) GetById(id string) (*models.Room, bool) {
	ctx := context.Background()
	cmd := h.redis.HGetAll(ctx, h.keyFromId(id))

	var room models.Room
	if err := cmd.Scan(&room); err != nil {
		log.Printf("room: unable to get by id: %v", err)
		return nil, false
	}

	if room.Id == "" {
		return nil, false
	}

	return &room, true
}

func (h *Room) RegisterClient(r *models.Room, c *models.Client) error {
	ctx := context.Background()
	cmd := h.redis.SAdd(ctx, h.keyForClients(r), c.Id)
	return cmd.Err()
}

func (h *Room) UnregisterClient(r *models.Room, c *models.Client) error {
	ctx := context.Background()
	cmd := h.redis.SRem(ctx, h.keyForClients(r), c.Id)
	return cmd.Err()
}

func (h *Room) GetClientIds(r *models.Room) ([]string, error) {
	ctx := context.Background()
	ids, err := h.redis.SMembers(ctx, h.keyForClients(r)).Result()
	if err != nil {
		return nil, err
	}

	return ids, nil
}

func (h *Room) keyFromId(id string) string {
	return fmt.Sprintf("room:%s", id)
}

func (h *Room) keyFromRoom(r *models.Room) string {
	return fmt.Sprintf("room:%s", r.Id)
}

func (h *Room) keyForClients(r *models.Room) string {
	return fmt.Sprintf("room:%s:clients", r.Id)
}
