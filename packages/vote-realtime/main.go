package main

import (
	"log"
	"os"
	"strings"

	_ "github.com/joelson-c/vote-realtime/migrations"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: hasRunWithGoCmd(),
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func hasRunWithGoCmd() bool {
	return strings.HasPrefix(os.Args[0], os.TempDir())
}
