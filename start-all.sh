#!/bin/bash

# Oblivion Protocol - Complete System Startup Script
# This script starts all services in the correct order

set -e

echo "🚀 Starting Oblivion Protocol - Real Integration"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if proof server is running
echo -n "Checking proof server on port 6300... "
if curl -s http://localhost:6300/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo ""
    echo "Please start the proof server first:"
    echo "  docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet"
    echo ""
    exit 1
fi

# Check backend port
echo -n "Checking if port 3001 is available... "
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3001 is in use${NC}"
    echo "Stopping existing backend..."
    kill $(lsof -t -i:3001) 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}✓ Available${NC}"

# Check frontend port
echo -n "Checking if port 3000 is available... "
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is in use${NC}"
    echo "Stopping existing frontend..."
    kill $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}✓ Available${NC}"

echo ""
echo "Starting services..."
echo "===================="
echo ""

# Start backend
echo "📦 Starting Backend API (Port 3001)..."
cd backend
npm install --silent
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -n "   Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

# Check if backend started successfully
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e " ${RED}✗ Failed${NC}"
    echo ""
    echo "Backend logs:"
    tail -20 logs/backend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend (Port 3000)..."
cd frontend
npm install --silent
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -n "   Waiting for frontend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

echo ""
echo ""
echo "=========================================="
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo "=========================================="
echo ""
echo "📍 Service URLs:"
echo "   - Frontend:     http://localhost:3000"
echo "   - Real Dashboard: http://localhost:3000/dashboard/real"
echo "   - Demo:         http://localhost:3000/demo"
echo "   - Backend API:  http://localhost:3001"
echo "   - Proof Server: http://localhost:6300"
echo ""
echo "📊 Process IDs:"
echo "   - Backend:  $BACKEND_PID"
echo "   - Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   - Backend:  logs/backend.log"
echo "   - Frontend: logs/frontend.log"
echo ""
echo "🎯 Quick Actions:"
echo "   - View backend logs:  tail -f logs/backend.log"
echo "   - View frontend logs: tail -f logs/frontend.log"
echo "   - Stop all services:  ./stop-all.sh"
echo ""
echo "✨ Try the real dashboard at: http://localhost:3000/dashboard/real"
echo ""
