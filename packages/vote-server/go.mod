module planningpoker/vote-server

go 1.23.1

replace planningpoker/domain_models => ../domain-models/dist_go

require (
	github.com/aws/aws-lambda-go v1.47.0
	planningpoker/domain_models v0.0.0-00010101000000-000000000000
)

require (
	github.com/aws/aws-sdk-go-v2 v1.32.0 // indirect
	github.com/aws/aws-sdk-go-v2/config v1.27.41 // indirect
	github.com/aws/aws-sdk-go-v2/credentials v1.17.39 // indirect
	github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue v1.15.10 // indirect
	github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression v1.7.45 // indirect
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.16.15 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.3.19 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.6.19 // indirect
	github.com/aws/aws-sdk-go-v2/internal/ini v1.8.1 // indirect
	github.com/aws/aws-sdk-go-v2/service/dynamodb v1.36.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/dynamodbstreams v1.24.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.12.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/endpoint-discovery v1.10.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.12.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/sso v1.24.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/ssooidc v1.28.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.32.0 // indirect
	github.com/aws/smithy-go v1.22.0 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	google.golang.org/protobuf v1.34.2 // indirect
)
