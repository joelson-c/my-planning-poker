module planningpoker/vote-server

go 1.23.1

replace planningpoker/domain_models => ../domain-models

require (
	github.com/aws/aws-lambda-go v1.47.0
	planningpoker/domain_models v0.0.0-00010101000000-000000000000
)

require google.golang.org/protobuf v1.34.2 // indirect
