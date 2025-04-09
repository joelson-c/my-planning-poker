module github.com/joelson-c/voteserver

go 1.24.1

require (
	ergo.services/application v0.0.0-20240904055159-7f2e1a954c05
	ergo.services/ergo v1.999.300
	ergo.services/logger v0.0.0-20250305130816-d9b7c57c219d
)

require (
	github.com/golang-jwt/jwt/v5 v5.2.2
	github.com/matoous/go-nanoid/v2 v2.1.0
	google.golang.org/protobuf v1.36.6
)

require github.com/joelson-c/votecoms v0.0.0-00010101000000-000000000000

require (
	ergo.services/meta v0.0.0-20240904054930-a97f6add8a78 // indirect
	github.com/fatih/color v1.16.0 // indirect
	github.com/gorilla/websocket v1.5.0
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	golang.org/x/sys v0.14.0 // indirect
)

replace github.com/joelson-c/votecoms => ../communication/go
