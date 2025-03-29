package message

import (
	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

func SetUpRoutes(r application.MessageRouter) {
	r.HandleFunc(models.VoteMessage, func(d *application.MessageHandlerData) error {
		return nil
	})
}
