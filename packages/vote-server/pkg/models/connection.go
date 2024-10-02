package models

type ConnectionHandler interface {
	Init()
}

type Connection struct {
	id string
}

func (con Connection) Init() {

}
