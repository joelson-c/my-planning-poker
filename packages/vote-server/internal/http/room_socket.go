package http

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/coder/websocket"
	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

type roomPayload struct {
	SessionId string `json:"sessionId"`
	RoomId    string `json:"roomId"`
}

const disconnectionTimeout = time.Minute

func (s *Server) HandleRoomSocket(w http.ResponseWriter, r *http.Request) {
	sessionId := r.PathValue("session")
	if sessionId == "" {
		http.Error(w, "missing session id", http.StatusBadRequest)
		return
	}

	session, ok := s.app.SessionHandler().GetById(sessionId)
	if !ok {
		log.Printf("room: failed to find session with id '%s'", sessionId)
		http.NotFound(w, r)
		return
	}

	err := s.app.SessionHandler().ClearTTL(session)
	if err != nil {
		log.Printf("room: failed to clear TTL for session '%s'", session.Id)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	defer s.app.SessionHandler().SetTTL(session, disconnectionTimeout)

	room, ok := s.app.RoomHandler().GetById(session.RoomId)
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

	client := models.NewClient(c)
	ctx := context.Background()

	session.ClientId = client.Id
	err = s.app.SessionHandler().Save(session)
	if err != nil {
		log.Printf("client: failed to update session with client id: %v", err)
		return
	}

	err = s.app.ClientHandler().Register(client)
	if err != nil {
		log.Printf("client: failed to register client information: %v", err)
		return
	}

	defer s.app.ClientHandler().Unregister(client)

	err = s.app.RoomHandler().RegisterClient(room, client)
	if err != nil {
		log.Printf("client: failed to register client information: %v", err)
		return
	}

	defer s.app.RoomHandler().UnregisterClient(room, client)

	err = s.app.SessionHandler().Save(session)
	if err != nil {
		log.Printf("client: failed to create client session: %v", err)
		return
	}

	s.app.BroadcastHandler().BroadcastForRoom(
		room,
		models.NewMessage(
			models.ClientJoinedMessage,
			map[string]any{
				"clientId": session.ClientId,
				"nickname": session.Nickname,
				"observer": session.Observer,
			},
		),
	)

	defer func() {
		s.app.BroadcastHandler().BroadcastForRoom(
			room,
			models.NewMessage(
				models.ClientLeaveMessage,
				map[string]any{"clientId": session.ClientId},
			),
		)
	}()

	dataChan, errChan := client.Run(ctx)
	for {
		select {
		case m := <-dataChan:
			d := &application.MessageHandlerData{
				App:     s.app,
				Client:  client,
				Msg:     m,
				Session: session,
			}
			s.app.MessageRouter().Dispatch(d)
		case err := <-errChan:
			log.Printf("client: stopping client: %v", err)
			return
		case <-ctx.Done():
			log.Printf("client: stopping client, context is done")
			return
		}
	}
}
