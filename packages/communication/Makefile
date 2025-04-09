SRC_DIR := src
DST_DIR_GO := go

proto:
	find $(DST_DIR_GO) -name "*.proto" -type f -delete
	protoc -I=$(SRC_DIR) --go_out=$(DST_DIR_GO) --go_opt=default_api_level=API_OPAQUE --go_opt=paths=source_relative $(SRC_DIR)/**/*.proto