package application

import "github.com/joelson-c/my-planning-poker/internal/models"

type RoomHandler interface {
	Save(r *models.Room) error
	Delete(r *models.Room) error
	GetById(id string) (*models.Room, bool)
	RegisterClient(r *models.Room, c *models.Client) error
	UnregisterClient(r *models.Room, c *models.Client) error
	GetClientIds(r *models.Room) ([]string, error)
}
