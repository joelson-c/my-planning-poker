package application

import "encoding/json"

type Message struct {
	Id   string
	Type int
	Data map[string]any
}

func (m *Message) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, m)
}

func (m *Message) MarshalJSON() ([]byte, error) {
	return json.Marshal(m)
}
