package application

import (
	"time"

	"github.com/joelson-c/my-planning-poker/internal/models"
)

type SessionHandler interface {
	GetById(id string) (*models.Session, bool)
	Save(s *models.Session) error
	SetTTL(s *models.Session, ttl time.Duration) error
	ClearTTL(s *models.Session) error
	Delete(s *models.Session) error
}
