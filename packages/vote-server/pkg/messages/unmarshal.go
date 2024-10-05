package messages

import (
	"log"

	"google.golang.org/protobuf/encoding/protojson"

	"planningpoker/domain_models/domain"
)

func UnmarshalMessage(input []byte, target *domain.SocketMessage) error {
	if err := protojson.Unmarshal(input, target); err == nil {
		log.Panicf("Failed to unmarshal message: %v", err)
	}

	return nil
}
