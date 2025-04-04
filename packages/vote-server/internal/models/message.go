package models

import gonanoid "github.com/matoous/go-nanoid/v2"

type MessageType int

const (
	UnknownMessage MessageType = iota
	ClientJoinedMessage
	ClientLeaveMessage
	VoteMessage
	RevealMessage
	ResetMessage
	ResultMessage
)

type Message struct {
	Id   string         `json:"id"`
	Type MessageType    `json:"type"`
	Data map[string]any `json:"data"`
}

func NewMessage(t MessageType, d map[string]any) *Message {
	return &Message{
		Id:   gonanoid.Must(),
		Type: t,
		Data: d,
	}
}

func (m *Message) IsValid() bool {
	return m.Id != "" && m.Type != UnknownMessage
}
