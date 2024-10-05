package actions

import (
	"context"
	"planningpoker/vote-server/pkg/db"
)

type BaseAction struct {
	Context   context.Context
	Client    db.DynamoDBAPI
	TableName string
}
