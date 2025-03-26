package application

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

const (
	gracefulServerTimeout = time.Second * 10
	httpReadTimeout       = time.Second * 10
	httpWriteTimeout      = time.Second * 10
)

type Application struct {
	context        *AppContext
	server         Server
	RoomHandler    RoomHandler
	ClientHandler  ClientHandler
	Broker         Broker
	SessionHandler SessionHandler
}

func New(
	appCtx *AppContext,
	server Server,
	roomHandler RoomHandler,
	clientHandler ClientHandler,
	broker Broker,
	sessionHandler SessionHandler,
) *Application {
	app := &Application{
		context:        appCtx,
		server:         server,
		RoomHandler:    roomHandler,
		ClientHandler:  clientHandler,
		Broker:         broker,
		SessionHandler: sessionHandler,
	}
	return app
}

func (a *Application) Run(ctx context.Context) error {
	log.Printf("application: running server on port %s", a.context.Config.Listen())

	mux := http.NewServeMux()
	a.server.RegisterRoutes(a, mux)
	h := &http.Server{
		Addr:         a.context.Config.Listen(),
		Handler:      mux,
		ReadTimeout:  httpReadTimeout,
		WriteTimeout: httpWriteTimeout,
	}

	var (
		stopChan = make(chan os.Signal, 1)
		errChan  = make(chan error, 1)
	)

	go func() {
		signal.Notify(stopChan, os.Interrupt)

		select {
		case <-stopChan:
		case <-ctx.Done():
		}

		timer, cancel := context.WithTimeout(context.Background(), gracefulServerTimeout)
		defer cancel()

		if err := h.Shutdown(timer); err != nil {
			errChan <- err
			return
		}

		errChan <- nil
	}()

	if err := h.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	return <-errChan
}
