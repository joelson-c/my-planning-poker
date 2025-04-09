package websocket

import (
	"net/http"
	"time"

	"ergo.services/ergo/gen"
)

type MessageConnect struct {
	ID      gen.Alias
	Request *http.Request
}

type MessageDisconnect struct {
	ID gen.Alias
}

type MessageType int
type Message struct {
	ID   gen.Alias
	Type MessageType
	Body []byte
}

type MessageInbound Message
type MessageOutbound Message

type Assign struct {
	Key   any
	Value any
}

type GetAssigned struct {
	Key any
}

type Unassign struct {
	Key any
}

type NonAuthenticatedTimeout struct {
	ID      gen.Alias
	Timeout time.Duration
}

const (
	MessageTypeText   MessageType = 1
	MessageTypeBinary MessageType = 2
	MessageTypeClose  MessageType = 8
	MessageTypePing   MessageType = 9
	MessageTypePong   MessageType = 10
)
