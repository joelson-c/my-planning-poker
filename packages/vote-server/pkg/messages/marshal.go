package messages

import (
	"google.golang.org/protobuf/encoding/protojson"

	domModels "planningpoker/domain_models/dist_go"
)

// Marshals the object into a base64 message
func MarshalMessage(message *domModels.SocketMessage) ([]byte, error) {
	return protojson.Marshal(message)
}
