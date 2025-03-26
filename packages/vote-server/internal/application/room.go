package application

import gonanoid "github.com/matoous/go-nanoid/v2"

type Room struct {
	Id string `redis:"id"`
}

const roomIdLength = 18

func NewRoom() *Room {
	return &Room{
		Id: gonanoid.Must(roomIdLength),
	}
}

type RoomHandler interface {
	Save(r *Room) error
	Delete(r *Room) error
	GetById(id string) (*Room, bool)
}
