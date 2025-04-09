## Project: "Server"

### Generated with

-   Types for the network messaging: true
-   Enabled Observer (http://localhost:9911): true
-   Loggers: colored

### Supervision Tree

Applications

-   `Vote{}` github.com/joelson-c/voteserver//github.com/joelson-c/voteserver//apps/vote/vote.go
    -   `RoomSup{}` github.com/joelson-c/voteserver//github.com/joelson-c/voteserver//apps/vote/roomsup.go
    -   `SessionSup{}` github.com/joelson-c/voteserver//github.com/joelson-c/voteserver//apps/vote/sessionsup.go

Process list that is starting by node directly

-   `VoteWeb{}` github.com/joelson-c/voteserver//github.com/joelson-c/voteserver//cmd/voteweb.go

Messages are generated for the networking in github.com/joelson-c/voteserver//github.com/joelson-c/voteserver//types.go

-   `MyMsg1{}`

#### Used command

This project has been generated with the `ergo` tool. To install this tool, use the following command:

`$ go install ergo.services/tools/ergo@latest`

Below the command that was used to generate this project:

`$ ergo -init Server -path server -with-app Vote -with-msg MyMsg1 -with-logger colored -with-observer -with-web VoteWeb{port:4001} -with-sup Vote:RoomSup -with-sup Vote:SessionSup `
