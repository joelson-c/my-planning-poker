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
				"CREATE UNIQUE INDEX ` + "`" + `idx_unique_nickname_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (\n  ` + "`" + `nickname` + "`" + `,\n  ` + "`" + `room` + "`" + `\n) WHERE room != ''",
				"CREATE INDEX ` + "`" + `idx_room` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `room` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `voteUsers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
			],
			"name": "voteUsers"
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
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_tokenKey_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_unique_nickname_room` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (\n  ` + "`" + `nickname` + "`" + `,\n  ` + "`" + `room` + "`" + `\n) WHERE room != ''",
				"CREATE INDEX ` + "`" + `idx_room` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `room` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_email_pbc_210352813` + "`" + ` ON ` + "`" + `vote_users` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''"
			],
			"name": "vote_users"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
