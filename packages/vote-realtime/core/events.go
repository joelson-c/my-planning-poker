package core

import (
	"github.com/joelson-c/vote-realtime/websocket"
)

type realtimeEventData struct {
	Message *websocket.Message
}

func (r *realtimeEventData) Tags() []string {
	if r.Message == nil {
		return nil
	}

	return []string{r.Message.Name}
}
