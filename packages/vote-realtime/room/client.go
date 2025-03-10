package room

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pocketbase/pocketbase/tools/hook"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512

	// Client channel buffer size
	bufferSize = 256
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	Id                string
	Server            *RoomServer
	Room              *Room
	conn              *websocket.Conn
	send              chan []byte
	sendClose         chan []byte
	sendCloseAck      chan bool
	sendMessage       chan *Message
	onIncomingMessage *hook.Hook[*MessageEvent]
	onOutboundMessage *hook.Hook[*MessageEvent]
}

// NewClientForConnection initializes and returns a new WebsocketClient instance.
func NewClientForConnection(id string, server *RoomServer, conn *websocket.Conn) *Client {
	return &Client{
		Id:                id,
		Server:            server,
		conn:              conn,
		send:              make(chan []byte, bufferSize),
		sendClose:         make(chan []byte),
		sendCloseAck:      make(chan bool),
		sendMessage:       make(chan *Message),
		onIncomingMessage: new(hook.Hook[*MessageEvent]),
		onOutboundMessage: new(hook.Hook[*MessageEvent]),
	}
}

// ServeWs handles websocket requests from clients requests.
func ServeWs(server *RoomServer, id string, w http.ResponseWriter, r *http.Request) (*Client, error) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil, err
	}

	client := NewClientForConnection(id, server, conn)

	go client.writePump()
	go client.readPump()

	return client, nil
}

func (c *Client) OnIncomingMessage(tags ...string) *hook.TaggedHook[*MessageEvent] {
	return hook.NewTaggedHook(c.onIncomingMessage, tags...)
}

func (c *Client) OnOutboundMessage(tags ...string) *hook.TaggedHook[*MessageEvent] {
	return hook.NewTaggedHook(c.onOutboundMessage, tags...)
}

func (c *Client) SendMessage() chan *Message {
	return c.sendMessage
}

func (c *Client) JoinRoom(room *Room) {
	c.Room = room
	c.Room.register <- c
	c.Server.register <- c
}

func (c *Client) DisconnectWithMessage(message []byte) {
	c.sendClose <- message
	// Wait for close msg send to complete
	<-c.sendCloseAck

	close(c.sendCloseAck)
}

func (c *Client) disconnect() {
	c.Room.unregister <- c
	c.Server.unregister <- c
	close(c.send)
	close(c.sendMessage)
	c.conn.Close()
}

func (c *Client) readPump() {
	defer func() {
		c.disconnect()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Client closed with a unexpected status: %v", err)
			}
			break
		}

		c.handleIncomingMessage(message)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The WsServer closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				log.Printf("Failed to aquire next connection writter: %v", err)
				return
			}

			w.Write(message)

			// Attach queued chat messages to the current websocket message.
			for range len(c.send) {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case message := <-c.sendClose:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			c.conn.WriteMessage(websocket.CloseMessage, message)
			c.sendCloseAck <- true
			return

		case message := <-c.sendMessage:
			c.OnOutboundMessage().Trigger(&MessageEvent{Message: message, Client: c}, func(me *MessageEvent) error {
				c.send <- message.Encode()
				return nil
			})
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleIncomingMessage(jsonMessage []byte) {
	var message Message
	message.Decode(jsonMessage)

	c.OnIncomingMessage().Trigger(&MessageEvent{Message: &message, Client: c})
}
