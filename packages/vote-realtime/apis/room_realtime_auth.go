package apis

import (
	"log/slog"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

const RequireWebsocketAuthMiddlewareId = "roomRealtimeAuth"

func RequireWebsocketAuth() *hook.Handler[*core.RequestEvent] {
	return &hook.Handler[*core.RequestEvent]{
		Id:   RequireWebsocketAuthMiddlewareId,
		Func: requireWebsocketAuth(),
	}
}

func requireWebsocketAuth() func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		authToken := e.Request.URL.Query().Get("token")
		if authToken == "" {
			return e.BadRequestError("Missing auth token.", nil)
		}

		user, err := e.App.FindAuthRecordByToken(authToken, core.TokenTypeAuth)
		if err != nil {
			e.App.Logger().Debug("Error while finding auth token record", slog.String("error", err.Error()))
			return e.UnauthorizedError("Invalid auth token.", err)
		}

		if user.Collection().Name != models.CollectionNameVoteUsers {
			e.App.Logger().Debug("Auth token collection is unexpected",
				slog.String("collection", user.Collection().Name),
				slog.String("expected", models.CollectionNameVoteUsers),
			)
			return e.UnauthorizedError("Invalid auth token.", nil)
		}

		_, err = e.App.FindRecordById(models.CollectionNameVoteRooms, user.GetString("room"))
		if err != nil {
			return e.NotFoundError("The requested room wasn't found.", err)
		}

		e.Auth = user
		return e.Next()
	}
}
