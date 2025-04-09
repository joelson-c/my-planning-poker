package main

import (
	"net/http"

	"ergo.services/ergo/gen"
	"github.com/joelson-c/votecoms/socket"
	"github.com/joelson-c/voteserver"
	"github.com/joelson-c/voteserver/lib/websocket"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

func factory_VoteSocketWorker() gen.ProcessBehavior {
	return &VoteSocketWorker{}
}

type VoteSocketWorker struct {
	websocket.SocketWorker
}

// Init invoked on a start this process.
func (w *VoteSocketWorker) Init(args ...any) error {
	w.Log().Info("started socket worker process with args %v", args)
	return nil
}

// HandleConnection invoked after the socket connects
func (w *VoteSocketWorker) HandleConnection(from gen.PID, ID gen.Alias, request *http.Request) error {
	return nil
}

// HandleDisconnection invoked after the socket disconnects
func (w *VoteSocketWorker) HandleDisconnection(from gen.PID, ID gen.Alias) error {
	return nil
}

// HandleInbound invoked after the server receives a new message from socket
func (w *VoteSocketWorker) HandleInbound(from gen.PID, ID gen.Alias, message websocket.MessageInbound) error {
	socketMsg := new(socket.Socket)

	if useJson, ok := w.Env(gen.Env("json_messages")); ok && useJson.(bool) {
		if err := protojson.Unmarshal(message.Body, socketMsg); err != nil {
			w.Log().Warning("recived invalid message from socket (%s): %s", ID, err)
			return nil
		}
	} else {
		if err := proto.Unmarshal(message.Body, socketMsg); err != nil {
			w.Log().Warning("recived invalid message from socket %s: %v", ID, err)
			return nil
		}
	}

	switch socketMsg.WhichMessage() {
	case socket.Socket_JoinRoom_case:
		if id, _ := w.getSocketSessionID(voteserver.SocketID(ID)); id != "" {
			w.Log().Info("socket %s send join room message while still authenticated: %s", ID)
			return nil
		}

		joinMsg := socketMsg.GetJoinRoom()
		result, err := w.Call(
			gen.Atom("sessionsup"),
			voteserver.StartSession{
				SocketID: voteserver.SocketID(ID),
				Token:    joinMsg.GetToken().GetValue(),
			},
		)

		if ok, _ := result.(bool); !ok {
			w.Log().Error("failed to start socket session for %s: %v / %v", ID, err, result)
			w.SendExitMeta(ID, voteserver.ErrSessionStart)
			return nil
		}
	}

	return nil
}

func (w *VoteSocketWorker) HandleMessage(from gen.PID, message any) error {
	switch m := message.(type) {
	case websocket.NonAuthenticatedTimeout:
		if _, err := w.getSocketSessionID(voteserver.SocketID(m.ID)); err != nil {
			w.Log().Error("failed to get socket session id: %v", err)
			w.SendExitMeta(m.ID, err)
			return nil
		}
	}
	return nil
}

func (w *VoteSocketWorker) getSocketSessionID(sid voteserver.SocketID) (string, error) {
	socketSession, err := w.CallWithPriority(
		gen.Alias(sid),
		websocket.GetAssigned{Key: "sessionId"},
		gen.MessagePriorityHigh,
	)

	if err != nil {
		return "", err
	}

	if id, ok := socketSession.(string); !ok {
		return "", voteserver.ErrAuthTimeout
	} else {
		return id, nil
	}
}
