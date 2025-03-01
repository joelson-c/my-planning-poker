package apis

import (
	"log"
	"log/slog"
	"runtime/debug"
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

// RealtimeClientAuthKey is the name of the realtime client store key that holds its auth state.
const WebsocketClientAuthKey = "auth"

const WebsocketChunkSize = 16

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
			Bind(apis.SkipSuccessActivityLog()).
			Unbind(apis.DefaultPanicRecoverMiddlewareId)

		sub.GET("/{roomId}", roomWebsocketHandler)

		return se.Next()
	})
}

func roomWebsocketHandler(e *core.RequestEvent) error {
	defer func() {
		if err := recover(); err != nil {
			log.Printf("RECOVERED FROM PANIC (safe to ignore): %v", err)
			log.Println(string(debug.Stack()))
		}
	}()

	room, user, err := validateUserCredentials(e)
	if err != nil {
		return err
	}

	conn, err := upgrader.Upgrade(e.Response, e.Request, nil)
	if err != nil {
		return err
	}

	defer conn.Close()

	realtimeApp := e.App.(realtimeCore.RealtimeApp)
	client := realtimeSocket.NewClientForConnection(conn)
	client.Subscribe(room.Id)
	client.Set(WebsocketClientAuthKey, user)
	realtimeApp.WebsocketBroker().Register(client)

	group := new(errgroup.Group)
	group.Go(func() error {
		return readPump(client, realtimeApp)
	})

	group.Go(func() error {
		return writePump(client, realtimeApp)
	})

	e.App.Logger().Debug("Websocket connection established.", slog.String("clientId", client.Id()))

	connectEvent := new(realtimeCore.WebsocketEvent)
	connectEvent.App = realtimeApp
	connectEvent.Client = client
	return realtimeApp.OnWebsocketConnected().Trigger(connectEvent, func(we *realtimeCore.WebsocketEvent) error {
		group.Wait()

		disconnectEvent := new(realtimeCore.WebsocketEvent)
		disconnectEvent.App = we.App
		disconnectEvent.Client = we.Client
		err = realtimeApp.OnWebsocketClosed().Trigger(disconnectEvent)
		return nil
	})
}

func readPump(c realtimeSocket.Client, app realtimeCore.RealtimeApp) error {
	defer func() {
		app.WebsocketBroker().Unregister(c.Id())
		c.Discard(nil)
	}()

	c.Connection().SetReadLimit(maxMessageSize)
	c.Connection().SetReadDeadline(time.Now().Add(pongWait))
	c.Connection().SetPongHandler(func(string) error {
		c.Connection().SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		app.Logger().Debug("Received message from websocket", slog.String("clientId", c.Id()))

		message := new(realtimeSocket.Message)
		err := c.Connection().ReadJSON(message)
		if err != nil {
			if _, ok := err.(*websocket.CloseError); !ok {
				app.Logger().Error("Error while reading websocket message", slog.String("error", err.Error()))
			}

			if websocket.IsUnexpectedCloseError(
				err,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
				CloseUserKickedFromRoom,
			) {
				app.Logger().Warn("Unexpected websocket close error", slog.String("error", err.Error()))
			}

			return err
		}

		messageEvent := new(realtimeCore.WebsocketMessageEvent)
		messageEvent.App = app
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
		c.Discard(nil)
	}()

	for {
		select {
		case message, ok := <-c.WriteChannel():
			c.Connection().SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Channel is closed
				app.Logger().Debug("Websocket closed", slog.String("clientId", c.Id()))
				c.Connection().WriteMessage(websocket.CloseMessage, c.CloseMessage())
				return nil
			}

			messageEvent := new(realtimeCore.WebsocketMessageEvent)
			messageEvent.App = app
			messageEvent.Client = c
			messageEvent.Message = message
			messageEvent.Direction = realtimeCore.MessageDirectionOutbound
			app.OnWebsocketMessage().Trigger(messageEvent, func(wme *realtimeCore.WebsocketMessageEvent) error {
				wme.App.Logger().Debug("Writing message to websocket", slog.String("clientId", wme.Client.Id()))
				err := wme.Client.Connection().WriteJSON(message)
				if err != nil {
					return err
				}

				return nil
			})
		case <-ticker.C:
			c.Connection().SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Connection().WriteMessage(websocket.PingMessage, nil); err != nil {
				return err
			}
		}
	}
}

func validateUserCredentials(e *core.RequestEvent) (*core.Record, *core.Record, error) {
	roomId := e.Request.PathValue("roomId")
	room, err := e.App.FindRecordById(models.CollectionNameVoteRooms, roomId)
	if err != nil {
		return nil, nil, e.NotFoundError("The requested room wasn't found.", err)
	}

	authToken := e.Request.URL.Query().Get("token")
	if authToken == "" {
		return nil, nil, e.BadRequestError("Missing auth token.", nil)
	}

	user, err := e.App.FindAuthRecordByToken(authToken, core.TokenTypeAuth)
	if err != nil {
		return nil, nil, e.UnauthorizedError("Invalid auth token.", err)
	}

	if user.Collection().Name != models.CollectionNameVoteUsers {
		return nil, nil, e.UnauthorizedError("Invalid auth token.", nil)
	}

	if user.GetString("room") != room.Id {
		return nil, nil, e.UnauthorizedError("Invalid auth token.", nil)
	}

	e.Auth = user
	return room, user, nil
}
