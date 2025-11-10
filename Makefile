# Oblivion Protocol Development Makefile

.PHONY: help install build test dev docker-up docker-down clean

# Default target
help:
	@echo "Oblivion Protocol Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install     Install all dependencies"
	@echo "  make setup       Run complete development setup"
	@echo ""
	@echo "Development:"
	@echo "  make dev         Start development servers"
	@echo "  make build       Build all components"
	@echo "  make test        Run all tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up          Start Docker services"
	@echo "  make docker-down        Stop Docker services"
	@echo "  make docker-logs        View Docker logs"
	@echo ""
	@echo "Proof Server:"
	@echo "  make proof-server-start   Start proof server"
	@echo "  make proof-server-stop    Stop proof server"
	@echo "  make proof-server-test    Test proof server connection"
	@echo "  make proof-server-logs    View proof server logs"
	@echo "  make proof-server-restart Restart proof server"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       Clean build artifacts"
	@echo "  make lint        Run linting"

# Installation
install:
	npm run install:all

setup:
	./scripts/setup-dev.sh

# Development
dev:
	@echo "Starting development servers..."
	@echo "Backend will be available at http://localhost:3000"
	@echo "Dashboard will be available at http://localhost:3001"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  make dev-backend"
	@echo "  make dev-dashboard"

dev-backend:
	npm run dev:backend

dev-dashboard:
	npm run dev:dashboard

# Building
build:
	npm run build:all

# Testing
test:
	npm run test:all

test-backend:
	npm run test:backend

test-sdk:
	npm run test:sdk

test-dashboard:
	npm run test:dashboard

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Proof Server
proof-server-start:
	@echo "Starting Midnight proof server on port 6300..."
	docker-compose up -d proof-server
	@echo "Proof server started. Testing connection..."
	@sleep 5
	@cd contracts && npm run test:proof-server || echo "Note: Run 'npm install' in contracts/ if test fails"

proof-server-stop:
	docker-compose stop proof-server

proof-server-logs:
	docker logs -f oblivion-proof-server

proof-server-test:
	@echo "Testing proof server connectivity..."
	@cd contracts && npm run test:proof-server

proof-server-restart:
	docker-compose restart proof-server
	@echo "Proof server restarted. Testing connection..."
	@sleep 5
	@cd contracts && npm run test:proof-server || echo "Note: Run 'npm install' in contracts/ if test fails"

# Utilities
clean:
	rm -rf node_modules */node_modules
	rm -rf dist */dist
	rm -rf .next */.next

lint:
	@echo "Linting will be implemented in later tasks"