package message

import (
	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

func SetUpRoutes(r application.MessageRouter) {
	r.HandleFunc(models.VoteMessage, handleVoteMessage)
	r.HandleFunc(models.RevealMessage, handleStatusChangeMessage)
	r.HandleFunc(models.ResetMessage, handleStatusChangeMessage)
	r.HandleFunc(models.ResultMessage, handleResultMessage)
}
