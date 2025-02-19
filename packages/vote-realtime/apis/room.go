package apis

import (
	"fmt"
	"net/http"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
	"github.com/pocketbase/pocketbase/tools/types"
)

type RoomAuthMeta struct {
	RoomId string `json:"roomId"`
}

func BindRoomHooks(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		BindRoomApis(se)
		return se.Next()
	})
}

func BindRoomApis(se *core.ServeEvent) {
	subGroup := se.Router.Group(fmt.Sprintf("/api/collections/%s/", models.CollectionNameVoteRooms)).
		Bind(apis.RequireAuth("voteUsers"))

	subGroup.POST("room-auth", func(e *core.RequestEvent) error {
		data := struct {
			Room       string `json:"room"     form:"room"`
			Nickname   string `json:"nickname" form:"nickname"`
			IsObserver bool   `json:"isObserver" form:"isObserver"`
		}{}

		if err := e.BindBody(&data); err != nil {
			return e.BadRequestError("Failed to read request data", err)
		}

		room, err := e.App.FindRecordById(models.CollectionNameVoteRooms, data.Room)
		if err != nil {
			return e.NotFoundError("The requested room wasn't found.", err)
		}

		if room.GetBool("closed") {
			return e.BadRequestError("The requested room is closed.", nil)
		}

		totalUsers, err := e.App.CountRecords(models.CollectionNameVoteUsers, dbx.HashExp{"room": room.Id})
		if err != nil {
			return err
		}

		if (totalUsers + 1) > models.MaxUsersByRoom {
			return e.TooManyRequestsError("The room has reached the maximum number of users.", nil)
		}

		collection, err := e.App.FindCollectionByNameOrId(models.CollectionNameVoteUsers)
		if err != nil {
			return err
		}

		userRecord := core.NewRecord(collection)
		userRecord.Set("nickname", data.Nickname)
		userRecord.Set("room", data.Room)
		userRecord.Set("observer", data.IsObserver)
		userRecord.Set("owner", totalUsers == 0)
		userRecord.Set("lastActive", types.NowDateTime())
		userRecord.SetRandomPassword()
		if err := e.App.Save(userRecord); err != nil {
			return err
		}

		return apis.RecordAuthResponse(e, userRecord, "room", &RoomAuthMeta{
			RoomId: data.Room,
		})
	}).Unbind(apis.DefaultRequireAuthMiddlewareId)

	subGroup.POST("reset/{id}", func(e *core.RequestEvent) error {
		record, err := e.App.FindRecordById(models.CollectionNameVoteRooms, e.Request.PathValue("id"))
		if err != nil {
			return e.NotFoundError("", err)
		}

		requestInfo, err := e.RequestInfo()
		if err != nil {
			return e.BadRequestError("Failed to retrieve request info", err)
		}

		rule := types.Pointer("@request.auth.room = id && state = 'REVEAL'")
		canAccess, err := e.App.CanAccessRecord(record, requestInfo, rule)
		if !canAccess {
			return e.ForbiddenError("", err)
		}

		e.App.Logger().Info(
			"Resetting votes for room",
			"room", record.Id,
		)

		roomUsers, err := e.App.FindAllRecords(
			"voteUsers",
			dbx.NewExp("room={:room}", dbx.Params{"room": record.Id}),
			dbx.NewExp("vote != ''"),
		)

		if err != nil {
			return err
		}

		e.App.RunInTransaction(func(txApp core.App) error {
			for _, user := range roomUsers {
				user.Set("vote", nil)

				if err := txApp.Save(user); err != nil {
					return err
				}
			}

			record.Set("state", "VOTING")
			if err := txApp.Save(record); err != nil {
				return err
			}

			return nil
		})

		return e.JSON(http.StatusOK, record)
	})

	subGroup.POST("remove-user", func(e *core.RequestEvent) error {
		targetRecord, targetErr := getTargetFromRequest(e)
		if targetErr != nil {
			return targetErr
		}

		requestInfo, err := e.RequestInfo()
		if err != nil {
			return e.BadRequestError("Failed to retrieve request info", err)
		}

		rule := types.Pointer("@request.auth.room = room && @request.auth.id != id")
		canAccess, err := e.App.CanAccessRecord(targetRecord, requestInfo, rule)
		if !canAccess {
			return e.ForbiddenError("", err)
		}

		settings := e.App.Settings()
		if settings.Logs.LogAuthId {
			e.App.Logger().Info(
				"Removing user from room",
				"room", e.Auth.GetString("room"),
				"user", targetRecord.Id,
			)
		}

		realtimeClientId := targetRecord.GetString("realtimeClientId")
		realtimeClient, err := e.App.SubscriptionsBroker().ClientById(realtimeClientId)
		if err != nil {
			return err
		}

		message := subscriptions.Message{
			Name: "ROOM_REMOVAL",
		}

		realtimeClient.Send(message)
		if err := e.App.Delete(targetRecord); err != nil {
			return err
		}

		return e.JSON(http.StatusNoContent, nil)
	})
}

func getTargetFromRequest(e *core.RequestEvent) (*core.Record, *router.ApiError) {
	data := struct {
		Target string `json:"target" form:"target"`
	}{}

	if err := e.BindBody(&data); err != nil {
		return nil, e.BadRequestError("Failed to read request data", err)
	}

	targetRecord, err := e.App.FindRecordById(models.CollectionNameVoteUsers, data.Target)
	if err != nil {
		return nil, e.NotFoundError("", err)
	}

	return targetRecord, nil
}
