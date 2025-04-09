package main

import (
	"net/http"
	"time"

	"github.com/joelson-c/voteserver/lib/websocket"

	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
	"ergo.services/ergo/meta"
)

func factory_VoteWeb() gen.ProcessBehavior {
	return &VoteWeb{}
}

var _ act.ActorBehavior = (*VoteWeb)(nil)

type VoteWeb struct {
	act.Actor
}

// Init invoked on a start this process.
func (w *VoteWeb) Init(args ...any) error {
	var webOptions meta.WebServerOptions

	mux := http.NewServeMux()

	if err := w.registerHttpRoutes(mux); err != nil {
		return err
	}

	if err := w.registerSocketRoute(mux); err != nil {
		return err
	}

	webOptions.Port = 4001
	webOptions.Host = "localhost"

	webOptions.Handler = mux

	webserver, err := meta.CreateWebServer(webOptions)
	if err != nil {
		w.Log().Error("unable to create Web server meta-process: %s", err)
		return err
	}
	webserverid, err := w.SpawnMeta(webserver, gen.MetaOptions{})
	if err != nil {
		// invoke Terminate to close listening socket
		webserver.Terminate(err)
		return err
	}

	https := "http"
	if webOptions.CertManager != nil {
		https = "https"
	}

	w.Log().Info("started Web server %s: use %s://%s:%d/", webserverid, https, webOptions.Host, webOptions.Port)
	w.Log().Info("you may check it with command below:")
	w.Log().Info("   $ curl -k %s://%s:%d", https, webOptions.Host, webOptions.Port)
	return nil
}

func (w *VoteWeb) registerHttpRoutes(mux *http.ServeMux) error {
	var routes map[string]gen.Atom = map[string]gen.Atom{
		"/session": "voteweb_pool",
	}

	for path, handler := range routes {
		// create and spawn root handler meta-process.
		root := meta.CreateWebHandler(meta.WebHandlerOptions{
			Worker: handler,
		})

		rootid, err := w.SpawnMeta(root, gen.MetaOptions{})
		if err != nil {
			w.Log().Error("unable to spawn WebHandler meta-process: %s", err)
			return err
		}

		// add it to the mux. you can also use middleware functions:
		// mux.Handle("/", middleware(root))
		mux.Handle(path, root)
		w.Log().Info("started WebHandler to serve '%s' (meta-process: %s)", path, rootid)
	}

	return nil
}

func (w *VoteWeb) registerSocketRoute(mux *http.ServeMux) error {
	root := websocket.CreateHandler(websocket.HandlerOptions{
		Worker:      "votesocket_pool",
		AuthTimeout: time.Minute * 2,
	})

	rootid, err := w.SpawnMeta(root, gen.MetaOptions{})
	if err != nil {
		w.Log().Error("unable to spawn Websocket meta-process: %s", err)
		return err
	}

	mux.Handle("/room", root)
	w.Log().Info("started WebHandler to serve '/room' (meta-process: %s)", rootid)
	return nil
}
