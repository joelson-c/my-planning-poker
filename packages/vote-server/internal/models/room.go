package models

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
