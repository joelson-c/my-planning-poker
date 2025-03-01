package apis

import (
	"fmt"

	"github.com/joelson-c/vote-realtime/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
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
	subGroup := se.Router.Group(fmt.Sprintf("/api/collections/%s/", models.CollectionNameVoteRooms))

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
	})
}
