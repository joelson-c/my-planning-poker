package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("vote_rooms")

		collection.ListRule = nil
		collection.ViewRule = types.Pointer("@request.auth.id != '' && users.id ?= @request.auth.id")
		collection.CreateRule = types.Pointer("")
		collection.UpdateRule = types.Pointer("@request.auth.id != '' && users.id ?= @request.auth.id && users.admin = true")
		collection.DeleteRule = nil

		usersCollection, err := app.FindCollectionByNameOrId("vote_users")
		if err != nil {
			return err
		}

		collection.Fields.Add(
			&core.SelectField{
				Name: "cardType",
				Values: []string{
					"FIBONACCI",
					"SIZES",
				},
				Required: true,
			},
			&core.SelectField{
				Name: "state",
				Values: []string{
					"VOTING",
					"REVEAL",
				},
				Required: true,
			},
			&core.BoolField{
				Name: "closed",
			},
			&core.RelationField{
				Name:         "users",
				CollectionId: usersCollection.Id,
				MaxSelect:    64,
			},
			&core.AutodateField{
				Name:     "created",
				OnCreate: true,
			},
			&core.AutodateField{
				Name:     "updated",
				OnCreate: true,
				OnUpdate: true,
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("vote_rooms")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
