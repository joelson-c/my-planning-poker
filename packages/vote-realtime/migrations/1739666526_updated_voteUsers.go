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
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_210352813` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE INDEX ` + "`" + `idx_unique_nickname_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (\n  ` + "`" + `nickname` + "`" + `,\n  ` + "`" + `room` + "`" + `\n) WHERE room != ''",
				"CREATE INDEX ` + "`" + `idx_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `room` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE INDEX ` + "`" + `idx_last_active` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `lastActive` + "`" + `)",
				"CREATE INDEX ` + "`" + `idx_realtime_client_id` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `realtimeClientId` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(12, []byte(`{
			"autogeneratePattern": "",
			"hidden": true,
			"id": "text137307681",
			"max": 0,
			"min": 0,
			"name": "realtimeClientId",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
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
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_210352813` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE INDEX ` + "`" + `idx_unique_nickname_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (\n  ` + "`" + `nickname` + "`" + `,\n  ` + "`" + `room` + "`" + `\n) WHERE room != ''",
				"CREATE INDEX ` + "`" + `idx_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `room` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE INDEX ` + "`" + `idx_last_active` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `lastActive` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("text137307681")

		return app.Save(collection)
	})
}
