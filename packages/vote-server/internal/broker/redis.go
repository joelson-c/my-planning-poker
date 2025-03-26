package broker

import (
	"github.com/joelson-c/my-planning-poker/internal/application"
)

type RedisBroker struct {
	application.Broker

	appCtx *application.AppContext
}

func NewRedis(ctx *application.AppContext) application.Broker {
	return &RedisBroker{
		appCtx: ctx,
	}
}
