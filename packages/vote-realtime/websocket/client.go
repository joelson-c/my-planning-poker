package websocket

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/pocketbase/pocketbase/tools/security"
)

// Message defines a client's channel data.
type Message struct {
	Name string          `json:"name"`
	Data json.RawMessage `json:"data"`
}

type Client interface {
	// Id Returns the unique id of the client.
	Id() string

	// WriteChannel returns the client's communication channel for sending messages.
	//
	// NB! The channel shouldn't be used after calling Discard().
	WriteChannel() chan *Message

	//  Returns the client's subscription.
	Subscription() string

	// Subscribe subscribes the client to the provided subscription topic.
	//
	// Example:
	//
	// 		Subscribe("subscriptionA")
	Subscribe(sub string)

	// Unsubscribe unsubscribes the client from the provided subscription topic.
	Unsubscribe(sub string)

	// HasSubscription checks if the client is subscribed to `sub`.
	HasSubscription(sub string) bool

	// Set stores any value to the client's context.
	Set(key string, value any)

	// Unset removes a single value from the client's context.
	Unset(key string)

	// Get retrieves the key value from the client's context.
	Get(key string) any

	// Discard marks the client as "discarded" (and closes its channel),
	// meaning that it shouldn't be used anymore for sending new messages.
	//
	// It is safe to call Discard() multiple times.
	// Use [websocket.FormatCloseMessage] to format a close message payload.
	Discard(closeMessage []byte)

	// IsDiscarded indicates whether the client has been "discarded"
	// and should no longer be used.
	IsDiscarded() bool

	// Send sends the specified message to the client's channel (if not discarded).
	Send(m *Message)

	// Gets the client's websocket connection.
	Connection() *websocket.Conn

	CloseMessage() []byte
}

var _ Client = (*DefaultClient)(nil)

type DefaultClient struct {
	store        map[string]any
	subscription string
	writeChannel chan *Message
	closeMessage []byte
	id           string
	mux          sync.RWMutex
	isDiscarded  bool
	conn         *websocket.Conn
}

func NewClientForConnection(conn *websocket.Conn) *DefaultClient {
	return &DefaultClient{
		id:           security.RandomString(40),
		store:        map[string]any{},
		writeChannel: make(chan *Message),
		subscription: "",
		closeMessage: []byte{},
		conn:         conn,
	}
}

// Id implements the [Client.Id] interface method.
func (c *DefaultClient) Id() string {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.id
}

// WriteChannel implements the [Client.WriteChannel] interface method.
func (c *DefaultClient) WriteChannel() chan *Message {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.writeChannel
}

// Subscription implements the [Client.Subscription] interface method.
func (c *DefaultClient) Subscription() string {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.subscription
}

// Subscribe implements the [Client.Subscribe] interface method.
func (c *DefaultClient) Subscribe(sub string) {
	c.mux.RLock()
	defer c.mux.RUnlock()

	c.subscription = sub
}

// Unsubscribe implements the [Client.Unsubscribe] interface method.
func (c *DefaultClient) Unsubscribe(sub string) {
	c.mux.RLock()
	defer c.mux.RUnlock()

	c.subscription = ""
}

// HasSubscription implements the [Client.HasSubscription] interface method.
func (c *DefaultClient) HasSubscription(sub string) bool {
	c.mux.RLock()
	defer c.mux.RUnlock()

	if c.subscription == "" {
		return false
	}

	return c.subscription == sub
}

// Get implements the [Client.Get] interface method.
func (c *DefaultClient) Get(key string) any {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.store[key]
}

// Set implements the [Client.Set] interface method.
func (c *DefaultClient) Set(key string, value any) {
	c.mux.Lock()
	defer c.mux.Unlock()

	c.store[key] = value
}

// Unset implements the [Client.Unset] interface method.
func (c *DefaultClient) Unset(key string) {
	c.mux.Lock()
	defer c.mux.Unlock()

	delete(c.store, key)
}

// Discard implements the [Client.Discard] interface method.
func (c *DefaultClient) Discard(closeMessage []byte) {
	c.mux.Lock()
	defer c.mux.Unlock()

	if c.isDiscarded {
		return
	}

	if closeMessage != nil {
		c.closeMessage = closeMessage
	}

	close(c.writeChannel)

	c.isDiscarded = true
}

// IsDiscarded implements the [Client.IsDiscarded] interface method.
func (c *DefaultClient) IsDiscarded() bool {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.isDiscarded
}

// Send sends the specified message to the client's channel (if not discarded).
func (c *DefaultClient) Send(m *Message) {
	if c.IsDiscarded() {
		return
	}

	c.WriteChannel() <- m
}

// Gets the client's websocket connection close message.
func (c *DefaultClient) CloseMessage() []byte {
	c.mux.RLock()
	defer c.mux.RUnlock()

	return c.closeMessage
}

// Connection implements the [Client.Connection] interface method.
func (c *DefaultClient) Connection() *websocket.Conn {
	return c.conn
}
