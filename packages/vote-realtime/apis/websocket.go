package apis

import (
	"bytes"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"runtime"
	"time"

	"github.com/gorilla/websocket"
	realtimeCore "github.com/joelson-c/vote-realtime/core"
	"github.com/joelson-c/vote-realtime/models"
	realtimeSocket "github.com/joelson-c/vote-realtime/websocket"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"golang.org/x/sync/errgroup"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func BindWebsocketHooks(app realtimeCore.RealtimeApp) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		sub := se.Router.Group("/api/ws/room").
			Bind(apis.RequireAuth("voteUsers")).
			Bind(apis.SkipSuccessActivityLog()).
			Unbind(apis.DefaultPanicRecoverMiddlewareId)

		sub.GET("/{roomId}", roomWebsocketHandler)

		return se.Next()
	})
}

func roomWebsocketHandler(e *core.RequestEvent) error {
	defer func() {
		recoverResult := recover()
		if recoverResult == nil {
			return
		}

		recoverErr, ok := recoverResult.(error)
		if !ok {
			recoverErr = fmt.Errorf("%v", recoverResult)
		} else if errors.Is(recoverErr, http.ErrAbortHandler) {
			// don't recover ErrAbortHandler so the response to the client can be aborted
			panic(recoverResult)
		}

		stack := make([]byte, 2<<10) // 2 KB
		length := runtime.Stack(stack, true)
		err := fmt.Errorf("[PANIC] %w %s", recoverErr, stack[:length])
		fmt.Println(err.Error())
	}()

	roomId := e.Request.PathValue("roomId")
	_, err := e.App.FindRecordById(models.CollectionNameVoteRooms, roomId)
	if err != nil {
		return e.NotFoundError("The requested room wasn't found.", err)
	}

	conn, err := upgrader.Upgrade(e.Response, e.Request, nil)
	if err != nil {
		return err
	}

	defer conn.Close()

	realtimeApp := e.App.(realtimeCore.RealtimeApp)
	client := realtimeSocket.NewClientForConnection(conn)
	client.Subscribe(roomId)
	realtimeApp.WebsocketBroker().Register(client)

	e.App.Logger().Debug("Websocket connection established.", slog.String("clientId", client.Id()))
	connectEvent := new(realtimeCore.WebsocketEvent)
	connectEvent.Client = client
	return realtimeApp.OnWebsocketConnected().Trigger(connectEvent, func(we *realtimeCore.WebsocketEvent) error {
		group := new(errgroup.Group)
		group.Go(func() error {
			return readPump(client, realtimeApp)
		})

		group.Go(func() error {
			return writePump(client, realtimeApp)
		})

		if err := group.Wait(); err != nil {
			e.App.Logger().Debug(
				"Websocket connection finished with error",
				slog.String("clientId", client.Id()),
				slog.String("error", err.Error()),
			)
		}

		disconnectEvent := new(realtimeCore.WebsocketEvent)
		disconnectEvent.Client = we.Client
		err = realtimeApp.OnWebsocketClosed().Trigger(disconnectEvent)
		return nil
	})
}

func readPump(c realtimeSocket.Client, app realtimeCore.RealtimeApp) error {
	defer func() {
		app.WebsocketBroker().Unregister(c.Id())
		c.Discard()
	}()

	c.Connection().SetReadLimit(maxMessageSize)
	c.Connection().SetReadDeadline(time.Now().Add(pongWait))
	c.Connection().SetPongHandler(func(string) error {
		c.Connection().SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Connection().ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				app.Logger().Error("Unexpected websocket close error", slog.String("error", err.Error()))
			}

			return err
		}

		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		app.Logger().Debug("Received message from websocket", slog.String("clientId", c.Id()))
		messageEvent := new(realtimeCore.WebsocketMessageEvent)
		messageEvent.Client = c
		messageEvent.Message = message
		messageEvent.Direction = realtimeCore.MessageDirectionInbound
		app.OnWebsocketMessage().Trigger(messageEvent)
	}
}

func writePump(c realtimeSocket.Client, app realtimeCore.RealtimeApp) error {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		app.WebsocketBroker().Unregister(c.Id())
		c.Discard()
	}()

	for {
		select {
		case message, ok := <-c.Channel():
			c.Connection().SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Channel is closed
				app.Logger().Debug("Websocket closed", slog.String("clientId", c.Id()))
				c.Connection().WriteMessage(websocket.CloseMessage, []byte{})
				return nil
			}

			w, err := c.Connection().NextWriter(websocket.TextMessage)
			if err != nil {
				return err
			}

			app.Logger().Debug("Writing message to websocket", slog.String("clientId", c.Id()))
			w.Write(message)

			if err := w.Close(); err != nil {
				return err
			}
		case <-ticker.C:
			c.Connection().SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Connection().WriteMessage(websocket.PingMessage, nil); err != nil {
				return err
			}
		}
	}
}
