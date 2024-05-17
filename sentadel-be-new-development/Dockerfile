FROM golang:1.20-alpine AS builder

LABEL maintainer="Sagara"

# Move to working directory (/build).
WORKDIR /build

# Copy and download dependency using go mod.
COPY go.mod go.sum ./
RUN go mod download

# Copy the code into the container.
COPY . .

RUN go build -o ./bin/http-server ./cmd/http/main.go

# Command to run when starting the container.
RUN pwd

ENV RB_ENV=development

ENTRYPOINT ["./bin/http-server", "--env-path", "./config/env/.env"]