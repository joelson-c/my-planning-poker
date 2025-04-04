package http

import (
	"context"
	"errors"
	"log"
	"net/http"
	"net/http/pprof"
	"os"
	"os/signal"
	"time"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

const (
	gracefulServerTimeout = time.Second * 10
	httpReadTimeout       = time.Second * 10
	httpWriteTimeout      = time.Second * 10
)

type Server struct {
	application.Server

	app application.Application
}

func NewServer(app application.Application) *Server {
	return &Server{
		app: app,
	}
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	log.Println("server: registering routes")
	mux.HandleFunc("GET /room/{session}", s.HandleRoomSocket)
	mux.HandleFunc("POST /start", s.HandleStart)

	// pprof
	mux.HandleFunc("GET /debug/pprof/", pprof.Index)
	mux.HandleFunc("GET /debug/pprof/cmdline", pprof.Cmdline)
	mux.HandleFunc("GET /debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("GET /debug/pprof/symbol", pprof.Symbol)
	mux.HandleFunc("GET /debug/pprof/trace", pprof.Trace)
}

func (s *Server) Run(ctx context.Context) error {
	log.Printf("application: running server on port %s", s.app.Config().Listen())

	mux := http.NewServeMux()

	s.RegisterRoutes(mux)
	h := &http.Server{
		Addr:         s.app.Config().Listen(),
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
