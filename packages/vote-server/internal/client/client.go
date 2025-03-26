package client

import (
	"time"

	"github.com/coder/websocket"
	"github.com/joelson-c/my-planning-poker/internal/application"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"golang.org/x/time/rate"
)

const (
	publishLimit      = time.Millisecond * 100
	publishBurstLimit = 8
	messageBufferSize = 16
)

type Client struct {
	application.Client

	id             string
	conn           *websocket.Conn
	send           chan *application.Message
	publishLimiter *rate.Limiter
}

func New(c *websocket.Conn) *Client {
	return &Client{
		id:             gonanoid.Must(),
		conn:           c,
		send:           make(chan *application.Message, messageBufferSize),
		publishLimiter: rate.NewLimiter(rate.Every(publishLimit), publishBurstLimit),
	}
}

func (c *Client) Id() string {
	return c.id
}

func (c *Client) Conn() *websocket.Conn {
	return c.conn
}

func (c *Client) Send() chan *application.Message {
	return c.send
}
