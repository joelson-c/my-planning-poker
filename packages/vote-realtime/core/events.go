package core

import "github.com/pocketbase/pocketbase/tools/subscriptions"

type realtimeEventData struct {
	Message *subscriptions.Message
}

func (r *realtimeEventData) Tags() []string {
	if r.Message == nil {
		return nil
	}

	return []string{r.Message.Name}
}
