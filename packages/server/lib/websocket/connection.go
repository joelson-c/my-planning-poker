package websocket

// Based on https://github.com/ergo-services/meta

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"sync/atomic"
	"time"

	"ergo.services/ergo/gen"
	ws "github.com/gorilla/websocket"
)

func CreateConnection(options ConnectionOptions) (gen.MetaBehavior, error) {
	if options.HandshakeTimeout == 0 {
		options.HandshakeTimeout = 15 * time.Second
	}
	dialer := &ws.Dialer{
		Proxy:             http.ProxyFromEnvironment,
		HandshakeTimeout:  options.HandshakeTimeout,
		EnableCompression: options.EnableCompression,
	}
	c, _, err := dialer.Dial(options.URL.String(), nil)
	if err != nil {
		return nil, err
	}

	return &connection{
		process: options.Process,
		conn:    c,
	}, nil
}

type ConnectionOptions struct {
	Process           gen.Atom
	URL               url.URL
	HandshakeTimeout  time.Duration
	EnableCompression bool
}

//
// Connection gen.MetaBehavior implementation
//

type connection struct {
	gen.MetaProcess
	conn         *ws.Conn
	request      *http.Request
	process      gen.Atom
	bytesIn      uint64
	bytesOut     uint64
	assignedData sync.Map
	authTimeout  time.Duration
}

func (c *connection) Init(process gen.MetaProcess) error {
	c.MetaProcess = process
	return nil
}

func (c *connection) Start() error {
	var to any

	id := c.ID()

	if c.process == "" {
		to = c.Parent()
	} else {
		to = c.process
	}

	defer func() {
		c.conn.Close()
		message := MessageDisconnect{
			ID: id,
		}
		if err := c.Send(to, message); err != nil {
			c.Log().Error("unable to send websocket.MessageDisconnect: %s", err)
			return
		}
	}()

	message := MessageConnect{
		ID:      id,
		Request: c.request,
	}
	if err := c.Send(to, message); err != nil {
		c.Log().Error("unable to send websocket.MessageConnect to %v: %s", to, err)
		return err
	}

	if c.authTimeout > 0 {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		go func() {
			c.Log().Info("waiting for %s to send websocket.NonAuthenticatedTimeout to %v", c.authTimeout, to)
			time.Sleep(c.authTimeout)

			if err := ctx.Err(); err != nil {
				// Ctx already cancelled
				return
			}

			message := NonAuthenticatedTimeout{
				ID:      id,
				Timeout: c.authTimeout,
			}

			if err := c.Send(to, message); err != nil {
				c.Log().Error("unable to send websocket.NonAuthenticatedTimeout to %v: %s", to, err)
			}
		}()
	}

	for {
		mt, m, err := c.conn.ReadMessage()
		if err != nil {
			if ws.IsCloseError(err, ws.CloseNormalClosure) || ws.IsCloseError(err, ws.CloseGoingAway) {
				return nil
			}
			return err
		}
		message := MessageInbound{
			ID:   id,
			Type: MessageType(mt),
			Body: m,
		}
		atomic.AddUint64(&c.bytesIn, uint64(len(m)))
		if err := c.Send(to, message); err != nil {
			c.Log().Error("unable to send websocket.Message: %s", err)
			return err
		}
	}
}

func (c *connection) HandleMessage(from gen.PID, message any) error {
	switch m := message.(type) {
	case MessageOutbound:
		if m.Type == 0 {
			m.Type = MessageTypeText
		}
		if err := c.conn.WriteMessage(int(m.Type), m.Body); err != nil {
			c.Log().Error("unable to write data into the web socket: %s", err)
			return err
		}
		atomic.AddUint64(&c.bytesOut, uint64(len(m.Body)))

	case Assign:
		c.assignedData.Store(m.Key, m.Value)
	case Unassign:
		c.assignedData.Delete(m.Key)
	default:
		c.Log().Error("unsupported message from %s. ignored", from)
	}
	return nil
}

func (c *connection) HandleCall(from gen.PID, ref gen.Ref, request any) (any, error) {
	switch r := request.(type) {
	case GetAssigned:
		v, ok := c.assignedData.Load(r.Key)
		if !ok {
			c.Log().Error("unable to get web socket assigned data: %s", r.Key)
			return false, nil
		}

		return v, nil
	}

	return gen.ErrUnsupported, nil
}

func (c *connection) Terminate(reason error) {
	c.conn.Close()
	if reason == nil || reason == gen.TerminateReasonNormal {
		return
	}
	c.Log().Error("terminated abnormaly: %s", reason)
}

func (c *connection) HandleInspect(from gen.PID, item ...string) map[string]string {
	bytesIn := atomic.LoadUint64(&c.bytesIn)
	bytesOut := atomic.LoadUint64(&c.bytesOut)
	return map[string]string{
		"local":     c.conn.LocalAddr().String(),
		"remote":    c.conn.RemoteAddr().String(),
		"process":   c.process.String(),
		"bytes in":  fmt.Sprintf("%d", bytesIn),
		"bytes out": fmt.Sprintf("%d", bytesOut),
	}
}
