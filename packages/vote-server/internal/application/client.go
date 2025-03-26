package application

import (
	"github.com/coder/websocket"
)

type Client interface {
	Id() string
	Conn() *websocket.Conn
	Send() chan *Message
}

type ClientHandler interface {
	Register(c Client) error
	Unregister(c Client) error
	GetById(id string) (Client, bool)
}
