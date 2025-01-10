package apis

import (
	"time"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
	"github.com/pocketbase/pocketbase/tools/types"
)

const heartbeatRate = time.Duration(3) * time.Minute

func BindHeartbeatApis(rg *router.RouterGroup[*core.RequestEvent]) {
	subGroup := rg.Group("/heartbeat").Bind(apis.RequireAuth("voteUsers"))
	subGroup.POST("", func(e *core.RequestEvent) error {
		authRecord := e.Auth.Fresh()
		authRecord.Set("lastActive", time.Now())
		if err := e.App.Save(authRecord); err != nil {
			return err
		}

		return e.Next()
	})
}

func PruneStaleUserConnections(app core.App) error {
	minValidDate := types.NowDateTime().Add(-1 * heartbeatRate)
	_, err := app.DB().
		Delete(models.CollectionNameVoteUsers, dbx.NewExp("[[lastActive]] < {:date}", dbx.Params{"date": minValidDate})).
		Execute()

	if err != nil {
		return err
	}

	return nil
}
