package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_210352813")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"cascadeDelete": true,
			"collectionId": "pbc_3547875533",
			"hidden": false,
			"id": "relation1923043739",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "room",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_210352813")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"cascadeDelete": true,
			"collectionId": "pbc_3547875533",
			"hidden": false,
			"id": "relation1923043739",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "room",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
