package main

import (
	"fmt"
	"io"
	"net/http"

	"github.com/joelson-c/votecoms/session"
	"github.com/joelson-c/voteserver"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	"github.com/joelson-c/voteserver/lib/auth"

	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
)

func factory_VoteWebWorker() gen.ProcessBehavior {
	return &VoteWebWorker{}
}

type VoteWebWorker struct {
	act.WebWorker
}

const minNicknameLength = 3

// Init invoked on a start this process.
func (w *VoteWebWorker) Init(args ...any) error {
	w.Log().Info("started web worker process with args %v", args)
	return nil
}

func (w *VoteWebWorker) HandlePost(from gen.PID, writer http.ResponseWriter, request *http.Request) error {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		w.Log().Error("failed to read body contents: %v", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	sessReq := new(session.Session)
	if err := protojson.Unmarshal(body, sessReq); err != nil {
		w.Log().Error("failed to unsmarshal session request body: %v", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	if err := w.validateRequest(sessReq); err != nil {
		w.Log().Error("invalid session request body: %v", err)
		writer.WriteHeader(http.StatusBadRequest)
		return err
	}

	if sessReq.GetRoomId() == "" {
		roomId, err := w.Call(gen.Atom("roomsup"), voteserver.StartRoom{})
		if err != nil {
			w.Log().Error("failed to create room for session (%v): %v", body, err)
			writer.WriteHeader(http.StatusInternalServerError)
			return err
		}

		id, ok := roomId.(voteserver.RoomID)
		if !ok {
			w.Log().Error("failed to create room for session (%v). unknown error: %v", body, roomId)
			writer.WriteHeader(http.StatusInternalServerError)
			return gen.ErrUnknown
		}

		sessReq.SetRoomId(string(id))
	}

	key, err := w.signKeyFromEnv()
	if err != nil {
		w.Log().Error("failed to get key to sign session: %v", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	answer, err := auth.CreateNewToken(sessReq, key)
	if err != nil {
		w.Log().Error("failed to create token for session %v: %v", body, err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	writer.Header().Add("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	answerJson, err := protojson.Marshal(answer)
	if err != nil {
		w.Log().Error("failed to marshal session answer: %v", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	if _, err := writer.Write(answerJson); err != nil {
		w.Log().Error("failed to write session answer to request: %v", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return err
	}

	w.Log().Info("created new token for session: %v", answer.GetSession())

	return nil
}

func (w *VoteWebWorker) signKeyFromEnv() ([]byte, error) {
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

func (w *VoteWebWorker) validateRequest(sr *session.Session) error {
	if err := proto.CheckInitialized(sr); err != nil {
		return err
	}

	if len(sr.GetNickname()) < minNicknameLength {
		return fmt.Errorf("invalid nickname '%s'", sr.GetNickname())
	}

	return nil
}
