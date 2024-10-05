package actions

import (
	"context"
	"fmt"
	"planningpoker/domain_models/domain/base"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/google/uuid"
)

type DbAction struct {
	Context   context.Context
	Client    *dynamodb.Client
	TableName string
}

const RoomsTableName = "planningpoker-voting-rooms"

func (action *DbAction) CreateRoom(cardType base.VotingCardType) (*base.VotingRoom, error) {
	roomId := uuid.New()
	room := &base.VotingRoom{
		RoomId:   roomId.String(),
		CardType: cardType,
		State:    base.VotingRoomState_VOTING,
	}

	item, err := attributevalue.MarshalMap(room)
	if err != nil {
		return nil, fmt.Errorf("Failed to marshal room object: %w", err)
	}

	_, err = action.Client.PutItem(action.Context, &dynamodb.PutItemInput{
		Item:      item,
		TableName: &action.TableName,
	})

	return room, err
}
