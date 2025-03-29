package application

import (
	"time"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

type Session struct {
	Id       string `redis:"id"`
	ClientId string `redis:"clientId"`
	Nickname string `redis:"nickname"`
	Observer bool   `redis:"observer"`
	RoomId   string `redis:"roomId"`
	Vote     string `redis:"vote"`
}

func NewSession(nickname string, roomId string, observer bool) *Session {
	return &Session{
		Id:       gonanoid.Must(),
		Nickname: nickname,
		RoomId:   roomId,
		Observer: observer,
		Vote:     "",
	}
}

type SessionHandler interface {
	GetById(id string) (*Session, bool)
	Save(s *Session) error
	SetTTL(s *Session, ttl time.Duration) error
	ClearTTL(s *Session) error
	Delete(s *Session) error
}
