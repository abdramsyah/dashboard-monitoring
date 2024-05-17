# Constants

PROJECT_NAME = 'sentadel-backend'
#DB_URL = 'postgres://postgres:r96MK92H6wKsBJih@103.183.75.216:5432/sentadell_db_2?sslmode=disable'
DB_URL = 'postgres://postgres:KMLmzwa8awaa@localhost:5432/sentadel_local_new_v1?sslmode=disable'
MGR_NAME =

ifeq ($(OS),Windows_NT) 
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell sh -c 'uname 2>/dev/null || echo Unknown')
endif

# Help

.SILENT: help
help:
	@echo
	@echo "Usage: make [command]"
	@echo
	@echo "Commands:"
	@echo " rename-project name={name}    Rename project"	
	@echo	
	@echo " build-http                    Build http server"
	@echo
	@echo " migration-create name={name}  Create migration"
	@echo " migration-up                  Up migrations"
	@echo " migration-down                Down last migration"
	@echo
	@echo " docker-up                     Up docker services"
	@echo " docker-down                   Down docker services"
	@echo
	@echo " fmt                           Format source code"
	@echo " test                          Run unit tests"
	@echo

# Build

.SILENT: rename-project
rename-project:
    ifeq ($(name),)
		@echo 'new project name not set'
    else
        ifeq ($(DETECTED_OS),Darwin)
			@grep -RiIl '$(PROJECT_NAME)' | xargs sed -i '' 's/$(PROJECT_NAME)/$(name)/g'
        endif

        ifeq ($(DETECTED_OS),Linux)
			@grep -RiIl '$(PROJECT_NAME)' | xargs sed -i 's/$(PROJECT_NAME)/$(name)/g'
        endif

        ifeq ($(DETECTED_OS),Windows)
			@grep 'target is not implemented on Windows platform'
        endif
    endif

.SILENT: build-http
build-http:
	@go build -o ./bin/http-server ./cmd/http/main.go
	@echo executable file \"http-server\" saved in ./bin/http-server


.SILENT: run-http
run-http:
	@./bin/http-server --env-path="./config/env/.env"

# Test

.SILENT: test
test:
	@go test ./... -v

# Create migration

.SILENT: migration-create
migration-create:
ifeq ($(MGR_NAME),)
	@echo 'new migration name not set'
else
	@migrate create -ext sql -dir ./migrations -seq $(MGR_NAME)
endif

# Up migration

.SILENT: migration-up
migration-up:
	@migrate -database $(DB_URL) -path ./migrations up

# Down migration

.SILENT: "migration-down"
migration-down:
	@migrate -database $(DB_URL) -path ./migrations down 1


.SILENT: seeder-create
seeder-create:
	@migrate create -ext sql -dir ./seeders -seq $(name)

.SILENT: seeder-up
seeder-up:
	@migrate -database $(DB_URL) -path ./seeders up


# Docker

.SILENT: docker-up
docker-up:
	@docker-compose up -d

.SILENT: docker-down
docker-down:
	@docker-compose down

# Format

.SILENT: fmt
fmt:
	@go fmt ./...

# Default

.DEFAULT_GOAL := help
