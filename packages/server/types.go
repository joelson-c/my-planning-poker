package voteserver

import (
	"fmt"

	"ergo.services/ergo/gen"
	"ergo.services/ergo/net/edf"
)

type SocketID gen.Alias

func (r SocketID) String() string {
	return fmt.Sprintf("Socket#<%s.%d.%d.%d>", r.Node.CRC32(), r.ID[0], r.ID[1], r.ID[2])
}

type StartSession struct {
	SocketID SocketID
	Token    string
}

type AuthSession struct {
	Token string
}

type RoomID gen.Atom

type StartRoom struct{}

type Room struct {
	RoomID RoomID
}

func init() {
	types := []any{
		SocketID{},
		StartSession{},
		AuthSession{},
		StartRoom{},
		RoomID(""),
		Room{},
	}

	for _, t := range types {
		err := edf.RegisterTypeOf(t)
		if err == nil || err == gen.ErrTaken {
			continue
		}

		panic(err)
	}
}
