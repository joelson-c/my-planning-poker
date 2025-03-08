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
		settings.TrustedProxy.Headers = []string{
			"X-Forwarded-For",
		}

		return app.Save(settings)
	}, nil)
}
