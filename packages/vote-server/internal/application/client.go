package application

import "github.com/joelson-c/my-planning-poker/internal/models"

type ClientHandler interface {
	Register(c *models.Client) error
	Unregister(c *models.Client) error
	GetById(id string) (*models.Client, bool)
}
