package handler

import "github.com/joelson-c/my-planning-poker/internal/application"

type ClientHandler struct {
	application.ClientHandler
}

func NewClientHandler() *ClientHandler {
	return &ClientHandler{}
}

func (c *ClientHandler) RegisterClient(client application.Client) error {
	return nil
}

func (c *ClientHandler) UnregisterClient(client application.Client) error {
	return nil
}

func (c *ClientHandler) GetClientById(id string) (application.Client, error) {
	return nil, nil
}
