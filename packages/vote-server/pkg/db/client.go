package db

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type DynamoDBClient struct {
	Client *dynamodb.Client
}

func NewDynamoDBClient(ctx context.Context) DynamoDBAPI {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("AWS_DYNAMODB_ENDPOINT"))
	})

	return &DynamoDBClient{Client: client}
}

func (d *DynamoDBClient) CreateItem(ctx context.Context, input *dynamodb.PutItemInput) (*dynamodb.PutItemOutput, error) {
	return d.Client.PutItem(ctx, input)
}

func (d *DynamoDBClient) GetItem(ctx context.Context, input *dynamodb.GetItemInput) (*dynamodb.GetItemOutput, error) {
	return d.Client.GetItem(ctx, input)
}

func (d *DynamoDBClient) UpdateItem(ctx context.Context, input *dynamodb.UpdateItemInput) (*dynamodb.UpdateItemOutput, error) {
	return d.Client.UpdateItem(ctx, input)
}

func (d *DynamoDBClient) DeleteItem(ctx context.Context, input *dynamodb.DeleteItemInput) (*dynamodb.DeleteItemOutput, error) {
	return d.Client.DeleteItem(ctx, input)
}

func (d *DynamoDBClient) QueryItems(ctx context.Context, input *dynamodb.QueryInput) (*dynamodb.QueryOutput, error) {
	return d.Client.Query(ctx, input)
}

func (d *DynamoDBClient) ScanItems(ctx context.Context, input *dynamodb.ScanInput) (*dynamodb.ScanOutput, error) {
	return d.Client.Scan(ctx, input)
}
