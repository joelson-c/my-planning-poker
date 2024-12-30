package main

import (
	"log"

	_ "github.com/joelson-c/vote-realtime/migrations"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: app.IsDev(),
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
