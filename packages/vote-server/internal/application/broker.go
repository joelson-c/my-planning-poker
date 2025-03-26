package application

type Broker interface {
	Subscribe(r *Room) (<-chan *Message, <-chan error)
	PublishMessage(c Client, m *Message) error
}
