package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joelson-c/votecoms/session"
	"github.com/joelson-c/voteserver"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"google.golang.org/protobuf/proto"
)

type TokenClaims struct {
	Nickname string `json:"nickname"`
	Observer bool   `json:"observer"`
	RoomID   string `json:"roomId"`
	jwt.RegisteredClaims
}

const TokenIssuer = "voting-server"

func CreateNewToken(sr *session.Session, signKey []byte) (*session.SessionResponse, error) {
	claims := TokenClaims{
		Nickname: sr.GetNickname(),
		Observer: sr.GetObserver(),
		RoomID:   sr.GetRoomId(),
		RegisteredClaims: jwt.RegisteredClaims{
			// A usual scenario is to set the expiration time relative to the current time
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    TokenIssuer,
			ID:        gonanoid.Must(),
			Audience:  []string{sr.GetRoomId()},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(signKey)
	if err != nil {
		return nil, err
	}

	answer := session.SessionResponse_builder{
		Session: sr,
		Token:   session.Token_builder{Value: proto.String(ss)}.Build(),
	}

	return answer.Build(), nil
}

func ParseToken(ts string, signKey []byte) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(ts, &TokenClaims{}, func(token *jwt.Token) (any, error) {
		return signKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok {
		return claims, nil
	}

	return nil, voteserver.ErrInvalidSessionToken
}
