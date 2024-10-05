package env

import (
	"log"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}
