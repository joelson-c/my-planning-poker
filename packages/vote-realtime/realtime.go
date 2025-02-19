package main

import (
	"log"

	"github.com/joelson-c/vote-realtime/core"
	_ "github.com/joelson-c/vote-realtime/migrations"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := core.NewRealtimeApp()
	bindAppHooks(app)

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: app.IsDev(),
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
