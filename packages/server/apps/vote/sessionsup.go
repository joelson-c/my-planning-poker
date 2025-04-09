package vote

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
	"github.com/joelson-c/voteserver"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func factory_SessionSup() gen.ProcessBehavior {
	return &SessionSup{}
}

type SessionSup struct {
	act.Supervisor
}

// Init invoked on a spawn Supervisor process. This is a mandatory callback for the implementation
func (sup *SessionSup) Init(args ...any) (act.SupervisorSpec, error) {
	var spec act.SupervisorSpec

	// set supervisor type
	spec.Type = act.SupervisorTypeSimpleOneForOne

	// add children
	spec.Children = []act.SupervisorChildSpec{
		{
			Name:    "session_initial",
			Factory: factory_Session,
		},
	}

	// set strategy
	spec.Restart.Strategy = act.SupervisorStrategyTransient
	spec.Restart.Intensity = 10 // How big bursts of restarts you want to tolerate.
	spec.Restart.Period = 2     // In seconds.
	spec.EnableHandleChild = true

	return spec, nil
}

// HandleChildStart invoked on a successful child process starting if option EnableHandleChild
// was enabled in act.SupervisorSpec
func (sup *SessionSup) HandleChildStart(name gen.Atom, pid gen.PID) error {
	return nil
}

// HandleChildTerminate invoked on a child process termination if option EnableHandleChild
// was enabled in act.SupervisorSpec
func (sup *SessionSup) HandleChildTerminate(name gen.Atom, pid gen.PID, reason error) error {
	return nil
}

func (sup *SessionSup) HandleCall(from gen.PID, ref gen.Ref, request any) (any, error) {
	switch r := request.(type) {
	case voteserver.StartSession:
		childName := gen.Atom("session_" + gonanoid.Must())
		err := sup.AddChild(act.SupervisorChildSpec{
			Name:    childName,
			Factory: factory_Session,
			Args: []any{
				r.SocketID,
				r.Token,
			},
		})

		if err != nil {
			sup.Log().Error("failed to start session for %s: %v", r.SocketID, err)
			sup.DisableChild(childName)
			return false, nil
		}

		if err := sup.StartChild(childName); err != nil {
			sup.Log().Error("failed to start session for %s: %v", r.SocketID, err)
			sup.DisableChild(childName)
			return false, nil
		}

		return true, nil
	}

	return gen.ErrUnsupported, nil
}

func (sup *SessionSup) HandleMessage(from gen.PID, message any) error {
	return nil
}
