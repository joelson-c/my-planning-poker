package application

import "net/http"

type Server interface {
	RegisterRoutes(app *Application, mux *http.ServeMux)
}
