package models

import (
	"slices"
	"strconv"
)

type Result struct {
	sessions []*Session

	voteCache []string
}

func NewResultForSessions(sessions []*Session) *Result {
	return &Result{
		sessions:  sessions,
		voteCache: nil,
	}
}

func (r *Result) ToMessage() map[string]any {
	return map[string]any{
		"average":      r.average(),
		"totalVotes":   r.totalVotes(),
		"median":       r.median(),
		"distribution": r.distribution(),
		"votesByUser":  r.votesByUser(),
	}
}

func (r *Result) average() float32 {
	if r.totalVotes() == 0 {
		return 0
	}

	var average float32
	for _, vote := range r.getVotes() {
		if v, err := strconv.Atoi(vote); err != nil {
			average += float32(v)
		}
	}

	return average / float32(r.totalVotes())
}

func (r *Result) totalVotes() int {
	return len(r.getVotes())
}

func (r *Result) median() float32 {
	var numericVotes []int
	for _, vote := range r.getVotes() {
		if v, err := strconv.Atoi(vote); err != nil {
			numericVotes = append(numericVotes, v)
		}
	}

	if len(numericVotes) == 0 {
		return 0
	}

	slices.Sort(numericVotes)

	middleNum := len(numericVotes) / 2

	if len(numericVotes)%2 == 0 {
		return float32(numericVotes[middleNum-1]+numericVotes[middleNum+1]) / 2
	}

	return float32(numericVotes[middleNum])
}

func (r *Result) distribution() map[string]int {
	votes := r.getVotes()
	d := make(map[string]int, len(votes))
	for _, vote := range votes {
		d[vote] += 1
	}

	return d
}

func (r *Result) votesByUser() map[string]string {
	d := make(map[string]string, len(r.sessions))
	for _, session := range r.sessions {
		if session.Vote != "" {
			d[session.Nickname] = session.Vote
		}
	}

	return d
}

func (r *Result) getVotes() []string {
	if r.voteCache != nil {
		return r.voteCache
	}

	var votes []string
	for _, session := range r.sessions {
		if session.Vote == "" {
			continue
		}

		votes = append(votes, session.Vote)
	}

	r.voteCache = votes
	return r.voteCache
}
