package main

import (
	"flag"

	"time"

	"github.com/joelson-c/voteserver/apps/vote"

	"ergo.services/application/observer"

	"ergo.services/logger/colored"

	"ergo.services/ergo"
	"ergo.services/ergo/gen"
	"ergo.services/ergo/lib"
)

var (
	OptionNodeName     string
	OptionNodeCookie   string
	OptionSignKey      string
	OptionJsonMessages bool
)

func init() {
	flag.StringVar(&OptionNodeName, "name", "Server@localhost", "node name")
	flag.StringVar(&OptionNodeCookie, "cookie", lib.RandomString(16), "a secret cookie for the network messaging")
	flag.StringVar(&OptionSignKey, "sign_key", lib.RandomString(32), "a secret for encoding session tokens")
	flag.BoolVar(&OptionJsonMessages, "json", false, "use Protobuf JSON format for messages")
}

func main() {
	var options gen.NodeOptions

	flag.Parse()

	// create applications that must be started
	apps := []gen.ApplicationBehavior{
		observer.CreateApp(observer.Options{}),
		vote.CreateVote(),
	}
	options.Applications = apps

	// disable default logger to get rid of multiple logging to the os.Stdout
	options.Log.DefaultLogger.Disable = true

	// add logger "colored".
	loggercolored, err := colored.CreateLogger(colored.Options{TimeFormat: time.DateTime})
	if err != nil {
		panic(err)
	}
	options.Log.Loggers = append(options.Log.Loggers, gen.Logger{Name: "colored", Logger: loggercolored})

	// set network options
	options.Network.Cookie = OptionNodeCookie
	options.Env = map[gen.Env]any{
		gen.Env("sign_key"):      OptionSignKey,
		gen.Env("json_messages"): OptionJsonMessages,
	}

	// starting node
	node, err := ergo.StartNode(gen.Atom(OptionNodeName), options)
	if err != nil {
		panic(err)
	}

	if OptionJsonMessages {
		node.Log().Warning("using JSON format for messages, performance may be slower than normal")
	}

	// register network messages
	//if err := node.Network().RegisterMessage(server.Messages...); err != nil {
	//	panic(err)
	//}

	// starting process VoteWeb
	if _, err := node.SpawnRegister("serversup", factory_ServerSup, gen.ProcessOptions{}); err != nil {
		panic(err)
	}

	node.Wait()
}
