package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_210352813")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id = id || (@request.auth.id != '' && @request.auth.collectionName = \"vote_users\" && @request.auth.room = room)",
			"viewRule": "@request.auth.id = id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_210352813")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id = id",
			"viewRule": "@request.auth.id = id || (@request.auth.id != '' && @request.auth.collectionName = \"vote_users\" && @request.auth.room = room)"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
