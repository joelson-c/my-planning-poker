package client

import (
	"context"
	"log"
	"time"

	"github.com/coder/websocket"
	"github.com/joelson-c/my-planning-poker/internal/application"
)

const (
	readTimeout  = time.Minute * 2
	writeTimeout = time.Minute * 2
	pingInterval = time.Second * 30
)

func (c *Client) Run(ctx context.Context) (<-chan *application.Message, <-chan error) {
	dataChan := make(chan *application.Message)
	errorChan := make(chan error)

	go c.read(ctx, dataChan, errorChan)
	go c.write(ctx, errorChan)

	return dataChan, errorChan
}

func (c *Client) SendMessage(m *application.Message) {
	c.send <- m
}

func (c *Client) read(ctx context.Context, m chan<- *application.Message, e chan<- error) {
	readCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	for {
		t, b, err := c.conn.Read(readCtx)
		if err != nil {
			log.Printf("client: failed to read message: %v", err)
			e <- err
			return
		}

		if t == websocket.MessageText {
			var msg application.Message
			if err := msg.UnmarshalJSON(b); err != nil {
				log.Printf("client: failed to unmarshal json messaged: %v", err)
				e <- err
				return
			}

			m <- &msg
		}
	}
}

func (c *Client) write(ctx context.Context, e chan<- error) {
	timer := time.NewTicker(pingInterval)
	defer timer.Stop()

	writeCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	for {
		select {
		case m := <-c.send:
			b, err := m.MarshalJSON()
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
