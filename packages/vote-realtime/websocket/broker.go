package websocket

import (
	"fmt"
	"slices"

	"github.com/pocketbase/pocketbase/tools/list"
	"github.com/pocketbase/pocketbase/tools/store"
	"golang.org/x/sync/errgroup"
)

// Broker defines a struct for managing subscriptions clients.
type Broker struct {
	clientStore       *store.Store[string, Client]
	subscriptionStore *store.Store[string, []string]
}

// NewBroker initializes and returns a new Broker instance.
func NewBroker() *Broker {
	return &Broker{
		clientStore:       store.New[string, Client](nil),
		subscriptionStore: store.New[string, []string](nil),
	}
}

// Clients returns a shallow copy of all registered clients indexed
// with their connection id.
func (b *Broker) Clients() map[string]Client {
	return b.clientStore.GetAll()
}

// ChunkedClients splits the current clients into a chunked slice.
func (b *Broker) ChunkedClients(chunkSize int) [][]Client {
	return list.ToChunks(b.clientStore.Values(), chunkSize)
}

// TotalClients returns the total number of registered clients.
func (b *Broker) TotalClients() int {
	return b.clientStore.Length()
}

// ClientById finds a registered client by its id.
//
// Returns non-nil error when client with clientId is not registered.
func (b *Broker) ClientById(clientId string) (Client, error) {
	client, ok := b.clientStore.GetOk(clientId)
	if !ok {
		return nil, fmt.Errorf("no client associated with connection ID %q", clientId)
	}

	return client, nil
}

// Register adds a new client to the broker instance.
func (b *Broker) Register(client Client) {
	b.clientStore.Set(client.Id(), client)
	subscriptionClients := b.subscriptionStore.Get(client.Subscription())
	b.subscriptionStore.Set(client.Subscription(), append(subscriptionClients, client.Id()))
}

// Unregister removes a single client by its id and marks it as discarded.
//
// If client with clientId doesn't exist, this method does nothing.
func (b *Broker) Unregister(clientId string) {
	client := b.clientStore.Get(clientId)
	if client == nil {
		return
	}

	client.Discard(nil)
	b.clientStore.Remove(clientId)

	subscriptionClients := b.subscriptionStore.Get(client.Subscription())
	subscriptionClients = slices.DeleteFunc(subscriptionClients, func(id string) bool {
		return id == clientId
	})
	b.subscriptionStore.Set(client.Subscription(), subscriptionClients)
}

// Get all clients that are subscribed to the provided subscription topic.
func (b *Broker) GetChunkedClientsBySubscription(sub string, chunkSize int) [][]Client {
	subClients := b.subscriptionStore.Get(sub)
	if subClients == nil {
		return nil
	}

	clients := make([]Client, 0, len(subClients))
	for _, clientId := range subClients {
		clients = append(clients, b.clientStore.Get(clientId))
	}

	return list.ToChunks(clients, chunkSize)
}

// Send a message to all clients that are subscribed to the provided subscription topic.
//
// The clients are chunked and sent in parallel.
// If skipClients is provided, the clients with those ids will be skipped.
func (b *Broker) BroadcastMessage(m *Message, sub string, chunkSize int, skipClients ...string) error {
	group := new(errgroup.Group)
	chunks := b.GetChunkedClientsBySubscription(sub, chunkSize)

	for _, chunk := range chunks {
		group.Go(func() error {
			for _, client := range chunk {
				if slices.Contains(skipClients, client.Id()) {
					continue
				}

				client.Send(m)
			}

			return nil
		})
	}

	return group.Wait()

}
