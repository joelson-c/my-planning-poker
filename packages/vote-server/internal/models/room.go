package models

import (
	"log"
	"slices"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

type CardPack = int

type Room struct {
	Id         string   `redis:"id"`
	IsRevealed bool     `redis:"state"`
	CardPack   CardPack `redis:"pack"`
}

const (
	FibonacciPack CardPack = iota
)

const roomIdLength = 18

func NewRoom() *Room {
	return &Room{
		Id:         gonanoid.Must(roomIdLength),
		IsRevealed: false,
		CardPack:   FibonacciPack,
	}
}

func (r *Room) GetCardPack() []string {
	switch r.CardPack {
	case FibonacciPack:
		return []string{"0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"}
	default:
		log.Printf("room: unknown card pack for room %s", r.Id)
		return []string{}
	}
}

func (r *Room) IsValidVote(vote string) bool {
	cards := r.GetCardPack()
	return slices.Contains(cards, vote)
}
