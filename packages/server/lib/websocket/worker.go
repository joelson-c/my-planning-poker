package websocket

import (
	"fmt"
	"net/http"
	"reflect"
	"runtime"
	"strings"

	"ergo.services/ergo/gen"
	"ergo.services/ergo/lib"
)

type SocketWorkerBehavior interface {
	gen.ProcessBehavior

	// Init invoked on a spawn SocketWorker for the initializing.
	Init(args ...any) error

	// HandleMessage invoked if SocketWorker received a message sent with gen.Process.Send(...).
	// Non-nil value of the returning error will cause termination of this process.
	// To stop this process normally, return gen.TerminateReasonNormal
	// or any other for abnormal termination.
	HandleMessage(from gen.PID, message any) error

	// HandleCall invoked if SocketWorker got a synchronous request made with gen.Process.Call(...).
	// Return nil as a result to handle this request asynchronously and
	// to provide the result later using the gen.Process.SendResponse(...) method.
	HandleCall(from gen.PID, ref gen.Ref, request any) (any, error)

	// Terminate invoked on a termination process
	Terminate(reason error)

	// HandleEvent invoked on an event message if this process got subscribed on
	// this event using gen.Process.LinkEvent or gen.Process.MonitorEvent
	HandleEvent(message gen.MessageEvent) error

	// HandleInspect invoked on the request made with gen.Process.Inspect(...)
	HandleInspect(from gen.PID, item ...string) map[string]string

	// Websocket specific callbacks
	// HandleConnection invoked after the socket connects
	HandleConnection(from gen.PID, ID gen.Alias, request *http.Request) error
	// HandleDisconnection invoked after the socket disconnects
	HandleDisconnection(from gen.PID, ID gen.Alias) error
	// HandleInbound invoked after the server receives a new message from socket
	HandleInbound(from gen.PID, ID gen.Alias, message MessageInbound) error
	// HandleOutbound invoked before the server sends a new message to socket
	HandleOutbound(from gen.PID, ID gen.Alias, message MessageOutbound) (MessageOutbound, error)
}

type SocketWorker struct {
	gen.Process

	behavior SocketWorkerBehavior
	mailbox  gen.ProcessMailbox
}

func (w *SocketWorker) ProcessInit(process gen.Process, args ...any) (rr error) {
	var ok bool
	if w.behavior, ok = process.Behavior().(SocketWorkerBehavior); ok == false {
		unknown := strings.TrimPrefix(reflect.TypeOf(process.Behavior()).String(), "*")
		return fmt.Errorf("ProcessInit: not a SocketWorkerBehavior %s", unknown)
	}
	w.Process = process
	w.mailbox = process.Mailbox()

	if lib.Recover() {
		defer func() {
			if r := recover(); r != nil {
				pc, fn, line, _ := runtime.Caller(2)
				w.Log().Panic("SocketWorker initialization failed. Panic reason: %#v at %s[%s:%d]",
					r, runtime.FuncForPC(pc).Name(), fn, line)
				rr = gen.TerminateReasonPanic
			}
		}()
	}

	return w.behavior.Init(args...)
}

func (w *SocketWorker) ProcessRun() (rr error) {
	var message *gen.MailboxMessage

	if lib.Recover() {
		defer func() {
			if r := recover(); r != nil {
				pc, fn, line, _ := runtime.Caller(2)
				w.Log().Panic("Socket terminated. Panic reason: %#v at %s[%s:%d]",
					r, runtime.FuncForPC(pc).Name(), fn, line)
				rr = gen.TerminateReasonPanic
			}
		}()
	}

	for {
		if w.State() != gen.ProcessStateRunning {
			// process was killed by the node.
			return gen.TerminateReasonKill
		}

		if message != nil {
			gen.ReleaseMailboxMessage(message)
			message = nil
		}

		for {
			// check queues
			msg, ok := w.mailbox.Urgent.Pop()
			if ok {
				// got new urgent message. handle it
				message = msg.(*gen.MailboxMessage)
				break
			}

			msg, ok = w.mailbox.System.Pop()
			if ok {
				// got new system message. handle it
				message = msg.(*gen.MailboxMessage)
				break
			}

			msg, ok = w.mailbox.Main.Pop()
			if ok {
				// got new regular message. handle it
				message = msg.(*gen.MailboxMessage)
				break
			}

			if _, ok := w.mailbox.Log.Pop(); ok {
				panic("web process can not be a logger")
			}

			// no messages in the mailbox
			return nil
		}

		switch message.Type {
		case gen.MailboxMessageTypeRegular:
			var reason error
			switch r := message.Message.(type) {
			case MessageConnect:
				reason = w.behavior.HandleConnection(message.From, r.ID, r.Request)
			case MessageDisconnect:
				reason = w.behavior.HandleDisconnection(message.From, r.ID)
			case MessageInbound:
				reason = w.behavior.HandleInbound(message.From, r.ID, r)
			case MessageOutbound:
				newMsg, outErr := w.behavior.HandleOutbound(message.From, r.ID, r)

				reason = outErr
				message.Message = newMsg
			default:
				if reason := w.behavior.HandleMessage(message.From, message.Message); reason != nil {
					return reason
				}
			}

			if reason != nil {
				return reason
			}
		case gen.MailboxMessageTypeRequest:
			var reason error
			var result any

			result, reason = w.behavior.HandleCall(message.From, message.Ref, message.Message)

			if reason != nil {
				// if reason is "normal" and we got response - send it before termination
				if reason == gen.TerminateReasonNormal && result != nil {
					w.SendResponse(message.From, message.Ref, result)
				}
				return reason
			}

			if result == nil {
				// async handling of sync request. response could be sent
				// later, even by the other process
				continue
			}

			w.SendResponse(message.From, message.Ref, result)

		case gen.MailboxMessageTypeEvent:
			if reason := w.behavior.HandleEvent(message.Message.(gen.MessageEvent)); reason != nil {
				return reason
			}

		case gen.MailboxMessageTypeExit:
			switch exit := message.Message.(type) {
			case gen.MessageExitPID:
				return fmt.Errorf("%s: %w", exit.PID, exit.Reason)

			case gen.MessageExitProcessID:
				return fmt.Errorf("%s: %w", exit.ProcessID, exit.Reason)

			case gen.MessageExitAlias:
				return fmt.Errorf("%s: %w", exit.Alias, exit.Reason)

			case gen.MessageExitEvent:
				return fmt.Errorf("%s: %w", exit.Event, exit.Reason)

			case gen.MessageExitNode:
				return fmt.Errorf("%s: %w", exit.Name, gen.ErrNoConnection)

			default:
				panic(fmt.Sprintf("unknown exit message: %#v", exit))
			}

		case gen.MailboxMessageTypeInspect:
			result := w.behavior.HandleInspect(message.From, message.Message.([]string)...)
			w.SendResponse(message.From, message.Ref, result)
		}
	}
}

func (w *SocketWorker) ProcessTerminate(reason error) {
	w.behavior.Terminate(reason)
}

// default callbacks for SocketWorkerBehavior interface
func (w *SocketWorker) Init(args ...any) error {
	return nil
}
func (w *SocketWorker) HandleMessage(from gen.PID, message any) error {
	w.Log().Warning("SocketWorker.HandleMessage: unhandled message from %s", from)
	return nil
}
func (w *SocketWorker) HandleCall(from gen.PID, ref gen.Ref, request any) (any, error) {
	w.Log().Warning("SocketWorker.HandleCall: unhandled request from %s", from)
	return nil, nil
}

func (w *SocketWorker) HandleEvent(message gen.MessageEvent) error {
	w.Log().Warning("SocketWorker.HandleEvent: unhandled event message %#v", message)
	return nil
}

func (w *SocketWorker) Terminate(reason error) {}
func (w *SocketWorker) HandleInspect(from gen.PID, item ...string) map[string]string {
	return nil
}

func (w *SocketWorker) HandleConnection(from gen.PID, ID gen.Alias, request *http.Request) error {
	w.Log().Warning("SocketWorker.HandleConnection: unhandled connection from %s with URI: %s", from, request.RequestURI)
	return nil
}

func (w *SocketWorker) HandleDisconnection(from gen.PID, ID gen.Alias) error {
	w.Log().Warning("SocketWorker.HandleDisconnection: unhandled disconnection from %s", from)
	return nil
}

func (w *SocketWorker) HandleInbound(from gen.PID, ID gen.Alias, message MessageInbound) error {
	w.Log().Warning("SocketWorker.HandleInbound: unhandled inbound message from %s (%v)", from, message)
	return nil
}

func (w *SocketWorker) HandleOutbound(from gen.PID, ID gen.Alias, message MessageOutbound) (MessageOutbound, error) {
	return message, nil
}
