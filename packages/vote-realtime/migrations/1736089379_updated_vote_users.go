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
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_unique_nickname_room` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (\n  ` + "`" + `nickname` + "`" + `,\n  ` + "`" + `room` + "`" + `\n)",
				"CREATE INDEX ` + "`" + `idx_room` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `room` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
			],
			"passwordAuth": {
				"enabled": false,
				"identityFields": []
			}
		}`), &collection); err != nil {
			return err
		}

		// add field
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
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_210352813")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE UNIQUE INDEX ` + "`" + `idx_nickname` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (nickname) WHERE nickname != ''"
			],
			"passwordAuth": {
				"enabled": true,
				"identityFields": [
					"nickname"
				]
			}
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation1923043739")

		return app.Save(collection)
	})
}
