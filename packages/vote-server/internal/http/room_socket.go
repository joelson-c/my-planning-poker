package http

import (
	"context"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/joelson-c/my-planning-poker/internal/client"
)

type roomPayload struct {
	SessionId string `json:"sessionId"`
	RoomId    string `json:"roomId"`
}

func (s *Server) HandleRoomSocket(w http.ResponseWriter, r *http.Request) {
	sessionId := r.PathValue("session")
	if sessionId == "" {
		http.Error(w, "missing session id", http.StatusBadRequest)
		return
	}

	session, ok := s.app.SessionHandler.GetById(sessionId)
	if !ok {
		log.Printf("room: failed to find session with id '%s'", sessionId)
		http.NotFound(w, r)
		return
	}

	err := s.app.SessionHandler.ClearTTL(session)
	if err != nil {
		log.Printf("room: failed to clear TTL for session '%s'", session.Id)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	defer s.app.SessionHandler.Delete(session)

	_, ok = s.app.RoomHandler.GetById(session.RoomId)
	if !ok {
		log.Printf("room: failed to find room with id '%s'", session.RoomId)
		http.Error(w, "room was not found", http.StatusNotFound)
		return
	}

	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		log.Printf("room: failed to accept new websocket connection: %v", err)
		return
	}

	defer c.CloseNow()

	client := client.New(c)
	ctx := context.Background()

	err = s.app.ClientHandler.Register(client)
	if err != nil {
		log.Printf("client: failed to register client information: %v", err)
		return
	}

	defer s.app.ClientHandler.Unregister(client)

	err = s.app.SessionHandler.Save(session)
	if err != nil {
		log.Printf("client: failed to create client session: %v", err)
		return
	}

	defer s.app.SessionHandler.Delete(session)

	dataChan, errChan := client.Run(ctx)
	for {
		select {
		case m := <-dataChan:
			err := s.app.Broker.PublishMessage(client, m)
			if err != nil {
				log.Printf("client: failed to publish message to broker: %v", err)
				return
			}
		case err := <-errChan:
			log.Printf("client: stopping client: %v", err)
			return
		case <-ctx.Done():
			log.Printf("client: stopping client, context is done")
			return
		}
	}
}
