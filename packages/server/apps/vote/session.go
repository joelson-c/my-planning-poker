package vote

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
	"github.com/joelson-c/voteserver"
	"github.com/joelson-c/voteserver/lib/auth"
	"github.com/joelson-c/voteserver/lib/websocket"
)

func factory_Session() gen.ProcessBehavior {
	return &Session{}
}

type Session struct {
	act.Actor

	socketID  voteserver.SocketID
	sessionId string
	nickname  string
	observer  bool
	vote      string
	roomId    string
}

func (a *Session) Init(args ...any) error {
	if len(args) < 2 {
		a.Log().Error("session process requires at least 2 arguments")
		return gen.ErrIncorrect
	}

	socketID, ok := args[0].(voteserver.SocketID)
	if !ok {
		a.Log().Error("invalid socket id for session %s", a.PID())
		return gen.ErrIncorrect
	}

	a.socketID = socketID

	token, ok := args[1].(string)
	if !ok {
		a.Log().Error("invalid token for session %s", a.PID())
		return gen.ErrIncorrect
	}

	key, err := a.signKeyFromEnv()
	if err != nil {
		a.Log().Error("failed to get key to sign session: %v", err)
		return err
	}

	claims, err := auth.ParseToken(token, key)
	if err != nil {
		a.Log().Error("failed to parse session token: %v", err)
		return gen.TerminateReasonShutdown
	}

	a.sessionId = claims.ID
	a.nickname = claims.Nickname
	a.observer = claims.Observer
	a.roomId = claims.RoomID

	a.Send(a.PID(), "init")
	a.Log().Info("started session %s for socket %s", a.PID(), a.socketID)
	return nil
}

func (a *Session) HandleMessage(from gen.PID, message any) error {
	if from == a.PID() {
		switch message {
		case "init":
			if err := a.MonitorAlias(gen.Alias(a.socketID)); err != nil {
				a.Log().Error("failed to link session %s against socket %s: %v", a.PID(), a.socketID, err)
				return err
			}

			a.Log().Info("linked session %s for socket %s", a.PID(), a.socketID)
			a.SendWithPriority(
				gen.Alias(a.socketID),
				websocket.Assign{
					Key:   "sessionId",
					Value: a.sessionId,
				},
				gen.MessagePriorityMax,
			)

			a.RegisterName(gen.Atom(a.sessionId))
			return nil
		}
	}

	switch m := message.(type) {
	case gen.MessageDownAlias:
		if m.Alias != gen.Alias(a.socketID) {
			return nil
		}

		// Linked socket was terminated, clean up the session with TerminateReasonNormal even if there are errors
		return gen.TerminateReasonNormal
	}

	return nil
}

func (a *Session) Terminate(reason error) {
	a.Log().Info("stopping session %s for socket %s", a.PID(), a.socketID)
}

func (w *Session) signKeyFromEnv() ([]byte, error) {
	env, ok := w.Env(gen.Env("sign_key"))
	if !ok {
		return nil, voteserver.ErrMissingSignKey
	}

	key, ok := env.(string)
	if !ok {
		return nil, voteserver.ErrMissingSignKey
	}

	return []byte(key), nil
}
