package room

import (
	"context"
)

// Room defines a struct for managing subscriptions clients.
type Room struct {
	Id string

	// Registered clients
	clients map[string]*Client

	// Brocast a message to all room users.
	broadcast chan *Message

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

// NewRoom initializes and returns a new Room instance.
func NewRoom(id string) *Room {
	return &Room{
		Id:         id,
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]*Client),
	}
}

func (r *Room) Broadcast() chan *Message {
	return r.broadcast
}

func (r *Room) GetClientById(id string) *Client {
	return r.clients[id]
}

// Runs the Room instance and listens for new messages and clients.
func (r *Room) run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case client := <-r.register:
			r.clients[client.Id] = client
		case client := <-r.unregister:
			if _, ok := r.clients[client.Id]; ok {
				delete(r.clients, client.Id)
			}
		case message := <-r.broadcast:
			r.publishRoomMessage(message)
		}
	}
}

func (r *Room) publishRoomMessage(message *Message) {
	encoded := message.Encode()

	for _, client := range r.clients {
		// Do not use client.SendMessage to avoid multiple message encoding
		client.OnOutboundMessage().Trigger(&MessageEvent{Client: client, Message: message}, func(me *MessageEvent) error {
			client.send <- encoded
			return nil
		})
	}
}
