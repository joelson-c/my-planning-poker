package main

import (
	"context"

	domModels "planningpoker/domain_models/dist_go"
	baseDomModels "planningpoker/domain_models/dist_go/base"
	"planningpoker/vote-server/pkg/messages"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.APIGatewayWebsocketProxyRequest) (string, error) {
	respMsg := domModels.SocketMessage_CreateRoomResponse{}
	resp := domModels.SocketMessage{Type: baseDomModels.MessageType_CREATE_ROOM_RESPONSE, Content: &respMsg}
	byteArr, err := messages.MarshalMessage(&resp)
	return string(byteArr), err
}

func main() {
	lambda.Start(handler)
	//handler(context.Background(), events.APIGatewayWebsocketProxyRequest{})
}
