package vote

import (
	"ergo.services/ergo/gen"
)

func CreateVote() gen.ApplicationBehavior {
	return &Vote{}
}

type Vote struct{}

// Load invoked on loading application using method ApplicationLoad of gen.Node interface.
func (app *Vote) Load(node gen.Node, args ...any) (gen.ApplicationSpec, error) {
	return gen.ApplicationSpec{
		Name:        "vote",
		Description: "description of this application",
		Mode:        gen.ApplicationModeTransient,
		Group: []gen.ApplicationMemberSpec{
			{
				Name:    "roomsup",
				Factory: factory_RoomSup,
			},
			{
				Name:    "sessionsup",
				Factory: factory_SessionSup,
			},
		},
	}, nil
}

// Start invoked once the application started
func (app *Vote) Start(mode gen.ApplicationMode) {}

// Terminate invoked once the application stopped
func (app *Vote) Terminate(reason error) {}
