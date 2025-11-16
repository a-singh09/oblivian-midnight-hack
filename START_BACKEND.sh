#!/bin/bash

# Oblivion Protocol - Backend Quick Start Script

echo "🚀 Starting Oblivion Protocol Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

cd backend

# Step 2: Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Step 3: Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
fi

# Step 4: Test database connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
psql "<ENTER_POSTGRESQL_URL>" -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    echo ""
    
    # Step 5: Ask if user wants to set up database
    echo -e "${YELLOW}Would you like to set up the database tables? (y/n)${NC}"
    read -r setup_db
    
    if [ "$setup_db" = "y" ] || [ "$setup_db" = "Y" ]; then
        echo -e "${BLUE}📊 Setting up database tables...${NC}"
        psql "<ENTER_POSTGRESQL_URL>" -f setup-database.sql
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database tables created${NC}"
            echo ""
        else
            echo -e "${YELLOW}⚠️  Database setup had some issues (tables might already exist)${NC}"
            echo ""
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Could not connect to database${NC}"
    echo "The backend will still start, but database operations may fail"
    echo ""
fi

# Step 6: Start the backend
echo -e "${GREEN}🎉 Starting backend server...${NC}"
echo ""
echo -e "${BLUE}Backend will be available at: http://localhost:3000${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
