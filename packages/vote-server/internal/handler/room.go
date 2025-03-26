package handler

import "github.com/joelson-c/my-planning-poker/internal/application"

type Room struct {
	application.RoomHandler
}

func NewRoomHandler() *Room {
	return &Room{}
}
