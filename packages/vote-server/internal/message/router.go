package message

import (
	"log"
	"sync"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

type Router struct {
	application.MessageRouter

	handlers map[models.MessageType][]application.MessageHandler
	mu       sync.Mutex
}

func NewRouter() application.MessageRouter {
	return &Router{
		handlers: make(map[models.MessageType][]application.MessageHandler),
	}
}

func (r *Router) HandleFunc(t models.MessageType, h application.MessageHandler) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.handlers[t] = append(r.handlers[t], h)
}

func (r *Router) Dispatch(d *application.MessageHandlerData) {
	handlers, ok := r.handlers[d.Msg.Type]
	if !ok {
		log.Printf("message: no handler assigned for message type '%d'", d.Msg.Type)
		return
	}

	for _, h := range handlers {
		if err := h(d); err != nil {
			log.Printf("message: error in message handling (message type: '%d') - %v", d.Msg.Type, err)
			return
		}
	}
}
