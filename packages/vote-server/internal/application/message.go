package application

import "github.com/joelson-c/my-planning-poker/internal/models"

type MessageHandlerData struct {
	App    Application
	Client *models.Client
	Msg    *models.Message
}

type MessageHandler func(d *MessageHandlerData) error

type MessageRouter interface {
	HandleFunc(t models.MessageType, h MessageHandler)
	Dispatch(d *MessageHandlerData)
}
