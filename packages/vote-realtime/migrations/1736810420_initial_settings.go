package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		settings := app.Settings()

		settings.Meta.AppName = "Vote Realtime"
		settings.Logs.MaxDays = 2
		settings.Logs.LogAuthId = true
		settings.RateLimits.Enabled = true
		settings.RateLimits.Rules = []core.RateLimitRule{
			{
				Label:       "/api/vote/collections/voteRooms/",
				Duration:    5,
				MaxRequests: 20,
			},
			{
				Label:       "/api/vote/collections/voteRooms/room-auth",
				Duration:    3,
				MaxRequests: 2,
			},
			{
				Label:       "*:auth",
				Duration:    3,
				MaxRequests: 2,
			},
			{
				Label:       "*:create",
				Duration:    20,
				MaxRequests: 5,
			},
			{
				Label:       "/api/batch/",
				Duration:    3,
				MaxRequests: 1,
			},
			{
				Label:       "/api/",
				Duration:    10,
				MaxRequests: 300,
			},
		}
		settings.TrustedProxy.Headers = []string{
			"X-Forwarded-For",
		}

		return app.Save(settings)
	}, nil)
}
