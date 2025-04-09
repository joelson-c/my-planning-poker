package voteserver

import "errors"

var ErrMissingSignKey = errors.New("sign key for tokens is missing from env")
var ErrAuthTimeout = errors.New("did not receive auth information")
var ErrInvalidSessionToken = errors.New("invalid session token")
var ErrSessionStart = errors.New("could not start session process")
