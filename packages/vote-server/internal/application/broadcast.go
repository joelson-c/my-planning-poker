package application

import "github.com/joelson-c/my-planning-poker/internal/models"

type BroadcastHandler interface {
	BroadcastForRoom(r *models.Room, m *models.Message) error
}
