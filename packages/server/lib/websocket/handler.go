package websocket

// Based on https://github.com/ergo-services/meta

import (
	"net/http"
	"time"

	"ergo.services/ergo/gen"
	"ergo.services/ergo/meta"
	ws "github.com/gorilla/websocket"
)

type HandlerOptions struct {
	HandshakeTimeout  time.Duration
	EnableCompression bool
	CheckOrigin       func(r *http.Request) bool
	Worker            gen.Atom
	AuthTimeout       time.Duration
}

type handler struct {
	gen.MetaProcess

	to         any
	upgrader   ws.Upgrader
	terminated bool
	ch         chan error
	options    HandlerOptions
}

func CreateHandler(options HandlerOptions) meta.WebHandler {
	if options.HandshakeTimeout == 0 {
		options.HandshakeTimeout = 15 * time.Second
	}

	return &handler{
		options: options,
		upgrader: ws.Upgrader{
			HandshakeTimeout:  options.HandshakeTimeout,
			EnableCompression: options.EnableCompression,
			CheckOrigin:       options.CheckOrigin,
		},
		ch: make(chan error),
	}
}

// Handler gen.MetaBehavior implementation
func (h *handler) Init(process gen.MetaProcess) error {
	h.MetaProcess = process
	if h.options.Worker == "" {
		h.to = h.Parent()
	} else {
		h.to = h.options.Worker
	}

	return nil
}

func (h *handler) Start() error {
	return <-h.ch
}

func (h *handler) HandleMessage(from gen.PID, message any) error {
	return nil
}

func (h *handler) HandleCall(from gen.PID, ref gen.Ref, request any) (any, error) {
	return nil, nil
}

func (h *handler) Terminate(reason error) {
	h.terminated = true
	h.ch <- reason
	close(h.ch)
}

func (h *handler) HandleInspect(from gen.PID, item ...string) map[string]string {
	return nil
}

// Handler http.Handler implementation
func (h *handler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	if h.MetaProcess == nil {
		http.Error(writer, "Handler is not initialized", http.StatusServiceUnavailable)
		return
	}

	if h.terminated {
		http.Error(writer, "Handler terminated", http.StatusServiceUnavailable)
		return
	}

	conn, err := h.upgrader.Upgrade(writer, request, nil)
	if err != nil {
		h.Log().Error("can not upgrade to websocket: %s", err)
		return
	}

	c := &connection{
		conn:        conn,
		request:     request,
		process:     h.options.Worker,
		authTimeout: h.options.AuthTimeout,
	}
	if _, err := h.Spawn(c, gen.MetaOptions{}); err != nil {
		conn.Close()
		h.Log().Error("unable to spawn meta process: %s", err)
	}
}
