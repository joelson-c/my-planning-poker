package messages

import (
	"google.golang.org/protobuf/encoding/protojson"

	domModels "planningpoker/domain_models/dist_go"
)

func UnmarshalMessage(input []byte, target *domModels.SocketMessage) error {
	if err := protojson.Unmarshal(input, target); err == nil {
		return err
	}

	return nil
}
