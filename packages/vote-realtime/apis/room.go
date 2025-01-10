package apis

import (
	"net/http"

	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
)

type RoomAuthMeta struct {
	RoomId string `json:"roomId"`
}

func BindRoomApis(app core.App, rg *router.RouterGroup[*core.RequestEvent]) {
	subGroup := rg.Group("/collections/voteRooms/").Bind(apis.RequireAuth("voteUsers"))

	subGroup.POST("room-auth", func(e *core.RequestEvent) error {
		data := struct {
			Room     string `json:"room"     form:"room"`
			Nickname string `json:"nickname" form:"nickname"`
			Password string `json:"password" form:"password"`
		}{}

		if err := e.BindBody(&data); err != nil {
			return e.BadRequestError("Failed to read request data", err)
		}

		record, err := e.App.FindFirstRecordByFilter(
			"voteUsers",
			"room={:room} && nickname={:nickname}",
			dbx.Params{"room": data.Room, "nickname": data.Nickname},
		)

		if err != nil || !record.ValidatePassword(data.Password) {
			// return generic 400 error as a basic enumeration protection
			return e.BadRequestError("Invalid credentials", err)
		}

		meta := RoomAuthMeta{
			RoomId: data.Room,
		}

		return apis.RecordAuthResponse(e, record, "room", meta)
	}).Unbind(apis.DefaultRequireAuthMiddlewareId)

	subGroup.POST("reset/{id}", func(e *core.RequestEvent) error {
		record, err := e.App.FindRecordById("voteRooms", e.Request.PathValue("id"))
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

		app.Logger().Info(
			"Resetting votes for room",
			"room", record.Id,
		)

		roomUsers, err := app.FindAllRecords(
			"voteUsers",
			dbx.NewExp("room={:room}", dbx.Params{"room": record.Id}),
			dbx.NewExp("vote != ''"),
		)

		if err != nil {
			return err
		}

		app.RunInTransaction(func(txApp core.App) error {
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

		settings := app.Settings()
		if settings.Logs.LogAuthId {
			app.Logger().Info(
				"Removing user from room",
				"room", e.Auth.GetString("room"),
				"user", targetRecord.Id,
			)
		}

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

	targetRecord, err := e.App.FindRecordById("voteUsers", data.Target)
	if err != nil {
		return nil, e.NotFoundError("", err)
	}

	return targetRecord, nil
}
