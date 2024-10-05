package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/joho/godotenv/autoload"

	"context"
	"log"

	"planningpoker/domain_models/domain"
	"planningpoker/domain_models/domain/base"
	"planningpoker/vote-server/pkg/actions"
	"planningpoker/vote-server/pkg/db"
	"planningpoker/vote-server/pkg/messages"
)

func handler(ctx context.Context) (string, error) {
	action := actions.DbAction{Client: db.GetClient(ctx), TableName: actions.RoomsTableName, Context: ctx}
	room, err := action.CreateRoom(base.VotingCardType_FIBONACCI)
	if err != nil {
		log.Panicf("Failed to create room: %v", err)
	}

	respMsg := domain.SocketMessage_CreateRoomResponse{CreateRoomResponse: &domain.CreateRoomResponse{Room: room}}
	resp := domain.SocketMessage{MsgType: base.MessageType_CREATE_ROOM_RESPONSE, Content: &respMsg}
	return messages.MarshalMessage(&resp), nil
}

func main() {
	lambda.Start(handler)
}
