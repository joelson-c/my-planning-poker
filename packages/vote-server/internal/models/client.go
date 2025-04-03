package models

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/coder/websocket"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"golang.org/x/time/rate"
)

const (
	publishLimit      = time.Millisecond * 100
	publishBurstLimit = 8
	messageBufferSize = 16
	readTimeout       = time.Minute * 2
	writeTimeout      = time.Minute * 2
	pingInterval      = time.Second * 30
)

type Client struct {
	Id             string
	SessionId      string
	conn           *websocket.Conn
	send           chan *Message
	publishLimiter *rate.Limiter
}

func NewClient(c *websocket.Conn, sessionId string) *Client {
	return &Client{
		Id:             gonanoid.Must(),
		SessionId:      sessionId,
		conn:           c,
		send:           make(chan *Message, messageBufferSize),
		publishLimiter: rate.NewLimiter(rate.Every(publishLimit), publishBurstLimit),
	}
}

func (c *Client) Run(ctx context.Context) (<-chan *Message, <-chan error) {
	dataChan := make(chan *Message)
	errorChan := make(chan error)

	go c.read(ctx, dataChan, errorChan)
	go c.write(ctx, errorChan)

	return dataChan, errorChan
}

func (c *Client) SendMessage(m *Message) {
	select {
	case c.send <- m:
	default:
		log.Printf("client: slow reader detected: %v", c.Id)
	}
}

func (c *Client) read(ctx context.Context, m chan<- *Message, e chan<- error) {
	readCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	for {
		t, b, err := c.conn.Read(readCtx)
		if err != nil {
			log.Printf("client: failed to read message: %v", err)
			e <- err
			return
		}

		time.AfterFunc(readTimeout, cancel)

		if t == websocket.MessageText {
			var msg Message
			if err := json.Unmarshal(b, &msg); err != nil {
				log.Printf("client: failed to unmarshal json messaged: %v", err)
				e <- err
				return
			}

			if msg.IsValid() {
				log.Printf("client: rcvd invalid message: %v", msg)
				continue
			}

			m <- &msg
		}
	}
}

func (c *Client) write(ctx context.Context, e chan<- error) {
	writeCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	timer := time.NewTicker(pingInterval)
	defer timer.Stop()

	for {
		select {
		case m := <-c.send:
			b, err := json.Marshal(m)
			if err != nil {
				log.Printf("client: failed to marshal json message to send: %v", err)
				e <- err
				return
			}

			c.conn.Write(writeCtx, websocket.MessageText, b)
		case <-ctx.Done():
			return
		case <-timer.C:
			err := c.conn.Ping(writeCtx)
			if err != nil {
				log.Printf("client: failed to ping client: %v", err)
				e <- err
				return
			}
		}
	}
}
