package apis

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

const maxInactiveLifetime = 3 * time.Minute
const maxUserLifetime = 30 * time.Minute

func BindPruneHooks(app core.App) {
	app.Cron().MustAdd("pruneStaleRoomUsers", "*/3 * * * *", func() {
		if err := pruneStaleUsers(app); err != nil {
			app.Logger().Warn("Failed to delete stale users", slog.String("error", err.Error()))
		}
	})

	app.Cron().MustAdd("pruneStaleRooms", "0 * * * *", func() {
		if err := pruneStaleRooms(app); err != nil {
			app.Logger().Warn("Failed to delete stale rooms", slog.String("error", err.Error()))
		}
	})
}

func pruneStaleUsers(app core.App) error {
	inactiveCutoffDate := types.NowDateTime().Add(-1 * maxInactiveLifetime)
	generalCutoffDate := types.NowDateTime().Add(-1 * maxUserLifetime)

	_, err := app.DB().
		Delete(
			models.CollectionNameVoteUsers,
			dbx.Or(
				dbx.And(
					dbx.NewExp("[[updated]] < {:inactiveDate}", dbx.Params{"inactiveDate": inactiveCutoffDate}),
					dbx.HashExp{"active": false},
				),
				dbx.NewExp("[[updated]] < {:generalDate}", dbx.Params{"generalDate": generalCutoffDate}),
			),
		).
		Execute()

	if err != nil {
		return err
	}

	return nil
}

func pruneStaleRooms(app core.App) error {
	_, err := app.DB().
		Delete(models.CollectionNameVoteRooms, dbx.NotExists(
			dbx.NewExp(
				fmt.Sprintf(
					"SELECT 1 FROM {{%s}} vu WHERE [[vu.room]] = [[%s.id]]",
					models.CollectionNameVoteUsers,
					models.CollectionNameVoteRooms,
				),
			),
		)).
		Execute()

	if err != nil {
		return err
	}

	return nil
}
