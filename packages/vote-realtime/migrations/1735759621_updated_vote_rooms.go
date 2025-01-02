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
			"updateRule": "@request.auth.id != '' && @request.auth.collectionName = 'vote_users' && ((@request.body.users:each = @request.auth.id) || (users.id ?= @request.auth.id && @request.auth.admin = true))"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3547875533")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"updateRule": "@request.auth.id != '' && @request.auth.collectionName = 'vote_users' && (@request.body.users.id = @request.auth.id || (users.id ?= @request.auth.id && @request.auth.admin = true))"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
