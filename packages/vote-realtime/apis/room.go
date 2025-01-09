package apis

import (
	"net/http"

	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
)

func BindRoomApis(app core.App, rg *router.RouterGroup[*core.RequestEvent]) {
	subGroup := rg.Group("/collections/vote_rooms/").Bind(apis.RequireAuth("vote_users"))

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
			"vote_users",
			"room={:room} && nickname={:nickname}",
			dbx.Params{"room": data.Room, "nickname": data.Nickname},
		)

		if err != nil || !record.ValidatePassword(data.Password) {
			// return generic 400 error as a basic enumeration protection
			return e.BadRequestError("Invalid credentials", err)
		}

		return apis.RecordAuthResponse(e, record, "room", nil)
	}).Unbind(apis.DefaultRequireAuthMiddlewareId)

	subGroup.POST("reset/{id}", func(e *core.RequestEvent) error {
		record, err := e.App.FindRecordById("vote_rooms", e.Request.PathValue("id"))
		if err != nil {
			return e.NotFoundError("", err)
		}

		requestInfo, err := e.RequestInfo()
		if err != nil {
			return e.BadRequestError("Failed to retrieve request info", err)
		}

		rule := types.Pointer("@request.auth.admin = true && state = 'REVEAL'")
		canAccess, err := e.App.CanAccessRecord(record, requestInfo, rule)
		if !canAccess {
			return e.ForbiddenError("", err)
		}

		app.Logger().Info(
			"Resetting votes for room",
			"room", record.Id,
		)

		roomUsers, err := app.FindAllRecords(
			"vote_users",
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

	subGroup.POST("transfer-admin", func(e *core.RequestEvent) error {
		targetRecord, targetErr := getTargetFromRequest(e)
		if targetErr != nil {
			return targetErr
		}

		requestInfo, err := e.RequestInfo()
		if err != nil {
			return e.BadRequestError("Failed to retrieve request info", err)
		}

		rule := types.Pointer("@request.auth.admin = true && @request.auth.room = room && admin = false && @request.auth.id != id")
		canAccess, err := e.App.CanAccessRecord(targetRecord, requestInfo, rule)
		if !canAccess {
			return e.ForbiddenError("", err)
		}

		currentUser := e.Auth.Clone()
		settings := app.Settings()
		if settings.Logs.LogAuthId {
			app.Logger().Info(
				"Transfering admin rights for room",
				"room", currentUser.GetString("room"),
				"from", currentUser.Id,
				"to", targetRecord.Id,
			)
		}

		app.RunInTransaction(func(txApp core.App) error {
			currentUser.Set("admin", false)
			if err := txApp.Save(currentUser); err != nil {
				return err
			}

			targetRecord.Set("admin", true)
			if err := txApp.Save(targetRecord); err != nil {
				return err
			}

			return nil
		})

		return e.JSON(http.StatusOK, targetRecord)
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

		rule := types.Pointer("@request.auth.admin = true && @request.auth.room = room && admin = false && @request.auth.id != id")
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

	targetRecord, err := e.App.FindRecordById("vote_users", data.Target)
	if err != nil {
		return nil, e.NotFoundError("", err)
	}

	return targetRecord, nil
}
