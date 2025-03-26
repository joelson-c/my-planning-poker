package session

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type Handler struct {
	application.SessionHandler

	appCtx *application.AppContext
}

func NewHandler(ctx *application.AppContext) application.SessionHandler {
	return &Handler{
		appCtx: ctx,
	}
}

func (h *Handler) GetById(id string) (*application.Session, bool) {
	ctx := context.Background()
	cmd := h.appCtx.Redis.HGetAll(ctx, h.keyFromId(id))

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

func (h *Handler) Save(s *application.Session) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.HSet(ctx, h.keyFromSession(s), s)
	return cmd.Err()
}

func (h *Handler) SetTTL(s *application.Session, ttl time.Duration) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.Expire(ctx, h.keyFromSession(s), ttl)
	return cmd.Err()
}

func (h *Handler) ClearTTL(s *application.Session) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.Persist(ctx, h.keyFromSession(s))
	return cmd.Err()
}

func (h *Handler) Delete(s *application.Session) error {
	ctx := context.Background()
	cmd := h.appCtx.Redis.Del(ctx, h.keyFromSession(s))
	return cmd.Err()
}

func (h *Handler) keyFromId(id string) string {
	return fmt.Sprintf("session:%s", id)
}

func (h *Handler) keyFromSession(s *application.Session) string {
	return fmt.Sprintf("session:%s", s.Id)
}
