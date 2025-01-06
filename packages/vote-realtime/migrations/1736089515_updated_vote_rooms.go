package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3547875533")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"updateRule": "@request.auth.id != '' && @request.auth.collectionName = 'vote_users' && @request.auth.room = id && @request.auth.admin = true",
			"viewRule": "@request.auth.id != '' && @request.auth.collectionName = 'vote_users' && @request.auth.room = id"
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation344172009")

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3547875533")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"updateRule": "@request.auth.id != ''",
			"viewRule": "@request.auth.id != '' && @request.auth.collectionName = 'vote_users' && users.id ?= @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_210352813",
			"hidden": false,
			"id": "relation344172009",
			"maxSelect": 64,
			"minSelect": 0,
			"name": "users",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
