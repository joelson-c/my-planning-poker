package main

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
)

func factory_ServerSup() gen.ProcessBehavior {
	return &ServerSup{}
}

type ServerSup struct {
	act.Supervisor
}

// Init invoked on a spawn Supervisor process. This is a mandatory callback for the implementation
func (sup *ServerSup) Init(args ...any) (act.SupervisorSpec, error) {
	var spec act.SupervisorSpec

	// set supervisor type
	spec.Type = act.SupervisorTypeOneForOne

	// add children
	spec.Children = []act.SupervisorChildSpec{
		{
			Name:    "voteweb",
			Factory: factory_VoteWeb,
		},
		{
			Name:    "voteweb_pool",
			Factory: factory_VoteWebPool,
		},
		{
			Name:    "votesocket_pool",
			Factory: factory_VoteSocketPool,
		},
	}

	// set strategy
	spec.Restart.Strategy = act.SupervisorStrategyTransient
	spec.Restart.Intensity = 2 // How big bursts of restarts you want to tolerate.
	spec.Restart.Period = 5    // In seconds.

	return spec, nil
}
