package room

import "github.com/pocketbase/pocketbase/tools/hook"

type RoomEvent struct {
	hook.Event
	Room *Room
}

type ClientEvent struct {
	hook.Event
	Client *Client
}

type MessageEvent struct {
	hook.Event
	Client  *Client
	Message *Message
}

func (e *MessageEvent) Tags() []string {
	if e.Message == nil {
		return nil
	}

	return []string{e.Message.Name}
}
