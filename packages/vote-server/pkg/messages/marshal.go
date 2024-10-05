package messages

import (
	"log"

	"google.golang.org/protobuf/encoding/protojson"

	"planningpoker/domain_models/domain"
)

// Marshals the object into a base64 message
func MarshalMessage(message *domain.SocketMessage) string {
	val, err := protojson.Marshal(message)
	if err != nil {
		log.Panicf("Failed to marshal message: %v", err)
	}

	return string(val)
}
