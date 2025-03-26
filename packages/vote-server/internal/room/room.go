package room

import (
	"github.com/joelson-c/my-planning-poker/internal/application"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

const roomIdLength = 18

type Room struct {
	application.Room

	id string
}

func New() application.Room {
	return &Room{
		id: gonanoid.Must(roomIdLength),
	}
}

func (r *Room) Id() string {
	return r.id
}
