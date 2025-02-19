package core

import (
	realtimeSocket "github.com/joelson-c/vote-realtime/websocket"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

type MessageDirection int

const (
	MessageDirectionInbound MessageDirection = iota
	MessageDirectionOutbound
)

type WebsocketEvent struct {
	hook.Event
	Client realtimeSocket.Client
}

type WebsocketMessageEvent struct {
	hook.Event
	Client    realtimeSocket.Client
	Message   []byte
	Direction MessageDirection
}

type RealtimeApp interface {
	core.App

	// WebsocketBroker returns the app websocket subscriptions broker instance.
	WebsocketBroker() *realtimeSocket.Broker

	// OnWebsocketConnected is triggered when a new websocket connection is established.
	OnWebsocketConnected() *hook.Hook[*WebsocketEvent]

	// OnWebsocketClosed is triggered when a websocket connection is closed.
	// The connection can be closed either by the client or by the server.
	OnWebsocketClosed() *hook.Hook[*WebsocketEvent]

	// OnWebsocketMessage is triggered when a new websocket message is received.
	//
	// Note that this hook is triggered for both client and server messages.
	OnWebsocketMessage() *hook.Hook[*WebsocketMessageEvent]
}
