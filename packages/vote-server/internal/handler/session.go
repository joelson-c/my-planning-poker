package handler

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/joelson-c/my-planning-poker/internal/application"
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

func (h *Session) GetById(id string) (*application.Session, bool) {
	ctx := context.Background()
	cmd := h.redis.HGetAll(ctx, h.keyFromId(id))

	var session application.Session
	if err := cmd.Scan(&session); err != nil {
		log.Printf("session: unable to get by id: %v", err)
		return nil, false
	}

	if session.Id == "" {
		return nil, false
	}

	return &session, true
}

func (h *Session) Save(s *application.Session) error {
	ctx := context.Background()
	cmd := h.redis.HSet(ctx, h.keyFromSession(s), s)
	return cmd.Err()
}

func (h *Session) SetTTL(s *application.Session, ttl time.Duration) error {
	ctx := context.Background()
	cmd := h.redis.Expire(ctx, h.keyFromSession(s), ttl)
	return cmd.Err()
}

func (h *Session) ClearTTL(s *application.Session) error {
	ctx := context.Background()
	cmd := h.redis.Persist(ctx, h.keyFromSession(s))
	return cmd.Err()
}

func (h *Session) Delete(s *application.Session) error {
	ctx := context.Background()
	cmd := h.redis.Del(ctx, h.keyFromSession(s))
	return cmd.Err()
}

func (h *Session) keyFromId(id string) string {
	return fmt.Sprintf("session:%s", id)
}

func (h *Session) keyFromSession(s *application.Session) string {
	return fmt.Sprintf("session:%s", s.Id)
}
