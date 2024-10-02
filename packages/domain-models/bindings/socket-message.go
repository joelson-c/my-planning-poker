package bindings

type MessageType string

const (
	CreateRoomRequest MessageType = "create_room_request"
)

type SocketMessage struct {
	Type    string
	Message string
}
