package vote

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
)

func factory_Room() gen.ProcessBehavior {
	return &Room{}
}

type Room struct {
	act.Actor
}
