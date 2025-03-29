package application

import (
	"net/http"
)

type Server interface {
	RegisterRoutes(mux *http.ServeMux)
}
