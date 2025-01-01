package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewAuthCollection("vote_users")

		var ownerRule = types.Pointer("@request.auth.id = id")
		collection.ViewRule = ownerRule
		collection.ListRule = ownerRule
		collection.UpdateRule = ownerRule
		collection.DeleteRule = ownerRule
		collection.CreateRule = types.Pointer("")

		collection.Fields.Add(
			&core.TextField{
				Name:     "nickname",
				Max:      64,
				Required: true,
			},
			&core.BoolField{
				Name: "admin",
			},
			&core.BoolField{
				Name: "observer",
			},
			&core.TextField{
				Name:   "vote",
				Max:    16,
				Hidden: true,
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

		collection.AddIndex("idx_nickname", true, "nickname", "nickname != ''")

		emailField := collection.Fields.GetByName("email").(*core.EmailField)
		emailField.Required = false

		collection.AuthAlert.Enabled = false
		collection.PasswordAuth.IdentityFields = []string{"nickname"}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("vote_users")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
