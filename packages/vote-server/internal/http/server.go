package http

import (
	"log"
	"net/http"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type Server struct {
	application.Server

	app *application.Application
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) RegisterRoutes(app *application.Application, mux *http.ServeMux) {
	log.Println("server: registering routes")

	s.app = app

	mux.HandleFunc("GET /room/{session}", s.HandleRoomSocket)
	mux.HandleFunc("POST /start", s.HandleStart)
}
