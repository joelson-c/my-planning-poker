package message

import (
	"fmt"

	"github.com/joelson-c/my-planning-poker/internal/application"
	"github.com/joelson-c/my-planning-poker/internal/models"
)

func SetUpRoutes(r application.MessageRouter) {
	r.HandleFunc(models.VoteMessage, func(d *application.MessageHandlerData) error {
		if d.Session.Observer {
			return fmt.Errorf("vote: user is observer, discarding message...")
		}

		room, ok := d.App.RoomHandler().GetById(d.Session.RoomId)
		if !ok {
			return fmt.Errorf("vote: unable to get active room for voting")
		}

		if room.State != models.VotingState {
			return fmt.Errorf("vote: room is not is not in voting state")
		}

		targetValue, ok := d.Msg.Data["value"].(string)
		if !ok {
			return fmt.Errorf("vote: invalid value provided in message")
		}

		if !room.IsValidVote(targetValue) {
			return fmt.Errorf("vote: invalid value provided in message")
		}

		d.Session.Vote = targetValue
		if err := d.App.SessionHandler().Save(d.Session); err != nil {
			return err
		}

		return d.App.BroadcastHandler().BroadcastForRoom(room, models.NewMessage(
			models.VoteMessage,
			map[string]any{"clientId": d.Session.ClientId},
		))
	})
}
