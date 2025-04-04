package handler

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
	"github.com/redis/go-redis/v9"
)

type Session struct {
	application.SessionHandler

	redis *redis.Client
}

func NewSession(redis *redis.Client) application.SessionHandler {
	return &Session{
		redis: redis,
	}
}

func (h *Session) GetById(id string) (*models.Session, bool) {
	ctx := context.Background()
	cmd := h.redis.HGetAll(ctx, h.keyFromId(id))

	session := new(models.Session)
	if err := cmd.Scan(session); err != nil {
		log.Printf("session: unable to get by id: %v", err)
		return nil, false
	}

	if session.Id == "" {
		return nil, false
	}

	return session, true
}

func (h *Session) Save(s *models.Session) error {
	ctx := context.Background()
	cmd := h.redis.HSet(ctx, h.keyFromId(s.Id), s)
	return cmd.Err()
}

func (h *Session) SetTTL(s *models.Session, ttl time.Duration) error {
	ctx := context.Background()
	cmd := h.redis.Expire(ctx, h.keyFromId(s.Id), ttl)
	return cmd.Err()
}

func (h *Session) ClearTTL(s *models.Session) error {
	ctx := context.Background()
	cmd := h.redis.Persist(ctx, h.keyFromId(s.Id))
	return cmd.Err()
}

func (h *Session) Delete(s *models.Session) error {
	ctx := context.Background()
	cmd := h.redis.Del(ctx, h.keyFromId(s.Id))
	return cmd.Err()
}

func (h *Session) keyFromId(id string) string {
	return fmt.Sprintf("session:%s", id)
}
