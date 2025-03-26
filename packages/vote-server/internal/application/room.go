package application

type Room interface {
	Id() string
}

type RoomHandler interface {
	Create(r Room) error
	Delete(r Room) error
	GetById(id string) (Room, bool)
	Exists(id string) bool
}
