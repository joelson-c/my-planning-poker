package vote

import (
	"github.com/joelson-c/voteserver"

	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func factory_RoomSup() gen.ProcessBehavior {
	return &RoomSup{}
}

type RoomSup struct {
	act.Supervisor
}

// Init invoked on a spawn Supervisor process. This is a mandatory callback for the implementation
func (sup *RoomSup) Init(args ...any) (act.SupervisorSpec, error) {
	var spec act.SupervisorSpec

	// set supervisor type
	spec.Type = act.SupervisorTypeSimpleOneForOne

	// add children
	spec.Children = []act.SupervisorChildSpec{
		{
			Name:    "room",
			Factory: factory_Room,
		},
	}

	// set strategy
	spec.Restart.Strategy = act.SupervisorStrategyTransient
	spec.Restart.Intensity = 2 // How big bursts of restarts you want to tolerate.
	spec.Restart.Period = 5    // In seconds.

	return spec, nil
}

func (sup *RoomSup) HandleMessage(from gen.PID, message any) error {
	return nil
}

func (sup *RoomSup) HandleCall(from gen.PID, ref gen.Ref, request any) (any, error) {
	switch request.(type) {
	case voteserver.StartRoom:
		roomId := sup.generateRoomId()
		if err := sup.StartChild("room", roomId); err != nil {
			sup.Log().Error("failed to create a room: %v", err)
			return gen.ErrUnknown, nil
		}

		return roomId, nil
	}

	return gen.ErrUnsupported, nil
}

func (sup *RoomSup) generateRoomId() voteserver.RoomID {
	return voteserver.RoomID(gonanoid.Must())
}
