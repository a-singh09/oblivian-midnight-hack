#!/bin/bash

# Oblivion Protocol Development Setup Script

echo "🚀 Setting up Oblivion Protocol development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Copy environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "⚠️  Please edit backend/.env with your configuration"
else
    echo "✅ backend/.env already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres proof-server

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker services are running"
else
    echo "❌ Some Docker services failed to start"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Start the backend: npm run dev:backend"
echo "3. Start the dashboard: npm run dev:dashboard"
echo ""
echo "Services:"
echo "- PostgreSQL: localhost:5432"
echo "- Proof Server: localhost:6300"
echo "- Backend API: localhost:3000 (when started)"
echo "- Dashboard: localhost:3001 (when started)"