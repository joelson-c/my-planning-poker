package room

import (
	"encoding/json"
	"log"
)

// Incoming/Bidirecional Messages
const (
	UserKickMessage   = "WS_KICK_USR"
	RoomRevealMessage = "WS_REVEAL"
	RoomResetMessage  = "WS_RESET"
)

// Outcoming Messages
const (
	UserConnectedMessage    = "WS_USER_CONNECTED"
	UserDisconnectedMessage = "WS_USER_DISCONNECTED"
	UserUpdatedMessage      = "WS_USER_UPDATED"
	GenericErrorMessage     = "WS_ERROR"
)

// Message defines a client's channel data.
type Message struct {
	Name string          `json:"name"`
	Data json.RawMessage `json:"data"`
}

func NewMessageWithData(name string, data any) *Message {
	m := &Message{
		Name: name,
	}

	if data != nil {
		encodedData, err := json.Marshal(&data)
		if err != nil {
			log.Printf("Failed to encode message data: %v", err)
			return nil
		}

		m.Data = json.RawMessage(encodedData)
	}

	return m
}

func (m *Message) Encode() []byte {
	if m.Data != nil {
		encodedData, err := json.Marshal(&m.Data)
		if err != nil {
			log.Printf("Failed to encode message data: %v", err)
			return nil
		}

		m.Data = json.RawMessage(encodedData)
	}

	encodedMsg, err := json.Marshal(m)
	if err != nil {
		log.Printf("Failed to encode message main payload: %v", err)
	}

	return encodedMsg
}

func (m *Message) Decode(data []byte) {
	err := json.Unmarshal(data, m)
	if err != nil {
		log.Printf("Failed to decode message: %v", err)
	}
}

func (m *Message) DecodeData(v any) {
	err := json.Unmarshal(m.Data, v)
	if err != nil {
		log.Printf("Failed to decode message data: %v", err)
	}
}

type GenericError struct {
	Error string `json:"error"`
}

type UserConnected struct {
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
	Observer string `json:"observer"`
}

type UserUpdated struct {
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
	HasVoted bool   `json:"hasVoted"`
	Observer bool   `json:"observer"`
}

type UserKick struct {
	Target string `json:"target"`
}
