package http

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/joelson-c/my-planning-poker/internal/application"
)

type startPayload struct {
	Nickname string `json:"nickname"`
	Observer bool   `json:"observer"`
	RoomId   string `json:"roomId"`
}

type startResponse struct {
	SessionId string `json:"sessionId"`
	RoomId    string `json:"roomId"`
}

const connectionTimeout = time.Minute * 2

func (s *Server) HandleStart(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var p startPayload
	err := decoder.Decode(&p)
	if err != nil {
		log.Printf("sess start: error while decoding payload json: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if p.Nickname == "" {
		http.Error(w, "missing nickname field", http.StatusBadRequest)
		return
	}

	var userRoom *application.Room
	if p.RoomId == "" {
		userRoom = application.NewRoom()
		err := s.app.RoomHandler.Save(userRoom)

		if err != nil {
			log.Printf("sess start: error while creating a new room: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		sessionRoom, ok := s.app.RoomHandler.GetById(p.RoomId)
		if !ok {
			log.Printf("sess start: error while getting a existing room: %v", err)
			http.NotFound(w, r)
			return
		}

		userRoom = sessionRoom
	}

	session := application.NewSession(p.Nickname, userRoom.Id, p.Observer)
	err = s.app.SessionHandler.Save(session)
	if err != nil {
		log.Printf("sess start: error saving the new client session: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = s.app.SessionHandler.SetTTL(session, connectionTimeout)
	if err != nil {
		log.Printf("sess start: error saving the new client session: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	response := &startResponse{
		SessionId: session.Id,
		RoomId:    userRoom.Id,
	}

	json.NewEncoder(w).Encode(response)
}
