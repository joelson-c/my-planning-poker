package room

import (
	"context"
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

const serverAppKey = "roomServer"

type RoomItem struct {
	room *Room
	// Stops the room's run loop.
	cancel context.CancelFunc
}

type RoomServer struct {
	rooms      map[string]*RoomItem
	register   chan *Client
	unregister chan *Client

	onRoomCreated        *hook.Hook[*RoomEvent]
	onRoomDeleted        *hook.Hook[*RoomEvent]
	onClientConnected    *hook.Hook[*ClientEvent]
	onClientDisconnected *hook.Hook[*ClientEvent]
}

// NewRoomServer initializes and returns a new Room Server instance.
func NewRoomServer() *RoomServer {
	return &RoomServer{
		rooms:                make(map[string]*RoomItem),
		register:             make(chan *Client),
		unregister:           make(chan *Client),
		onRoomCreated:        new(hook.Hook[*RoomEvent]),
		onRoomDeleted:        new(hook.Hook[*RoomEvent]),
		onClientConnected:    new(hook.Hook[*ClientEvent]),
		onClientDisconnected: new(hook.Hook[*ClientEvent]),
	}
}

// Saves the server instance to root app store
func (r *RoomServer) ToAppStore(app core.App) {
	app.Store().Set(serverAppKey, r)
}

// Gets the server instance from root app store
func ServerFromAppStore(app core.App) *RoomServer {
	return app.Store().Get(serverAppKey).(*RoomServer)
}

func (r *RoomServer) Run() {
	for {
		select {

		case client := <-r.register:
			r.registerClient(client)

		case client := <-r.unregister:
			r.unregisterClient(client)
		}
	}
}

// Same as [RoomServer.GetById], but returns a second value to indicate if the key exists in the store.
func (r *RoomServer) GetRoomById(id string) (*Room, bool) {
	item, ok := r.rooms[id]
	if !ok {
		return nil, ok
	}

	return item.room, ok
}

func (r *RoomServer) CreateRoom(id string) *Room {
	room := NewRoom(id)
	ctx, cancel := context.WithCancel(context.Background())
	r.rooms[id] = &RoomItem{
		room:   room,
		cancel: cancel,
	}

	go room.run(ctx)

	r.OnRoomCreated().Trigger(&RoomEvent{Room: room})
	return room
}

func (r *RoomServer) CloseRoom(id string) error {
	item := r.rooms[id]
	if item == nil {
		return fmt.Errorf("Room with ID %s not found", id)
	}

	return r.OnRoomCreated().Trigger(&RoomEvent{Room: item.room}, func(re *RoomEvent) error {
		item.cancel()
		delete(r.rooms, id)
		return nil
	})
}

func (r *RoomServer) OnRoomCreated() *hook.Hook[*RoomEvent] {
	return r.onRoomCreated
}

func (r *RoomServer) OnClientConnected() *hook.Hook[*ClientEvent] {
	return r.onClientConnected
}

func (r *RoomServer) OnClientDisconnected() *hook.Hook[*ClientEvent] {
	return r.onClientDisconnected
}

func (r *RoomServer) Register() chan *Client {
	return r.register
}

func (r *RoomServer) Unregister() chan *Client {
	return r.register
}

func (r *RoomServer) registerClient(client *Client) {
	r.OnClientConnected().Trigger(&ClientEvent{Client: client})
}

func (r *RoomServer) unregisterClient(client *Client) {
	r.OnClientDisconnected().Trigger(&ClientEvent{Client: client})
}
