#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Sistem Reservasi - Docker Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
fi

echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build --no-cache

echo ""
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Wait for postgres to be healthy
echo -e "${YELLOW}⏳ Checking database health...${NC}"
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U reservasi -d reservasi_db > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
    sleep 2
done

echo ""
echo -e "${YELLOW}📦 Running database migrations...${NC}"
docker compose exec -T backend npx prisma db push

echo ""
echo -e "${YELLOW}🌱 Seeding database...${NC}"
docker compose exec -T backend npx tsx prisma/seed.ts

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📌 Application URLs:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "   Database: ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${BLUE}👤 Admin Login:${NC}"
echo -e "   Email:    ${GREEN}admin@reservasi.com${NC}"
echo -e "   Password: ${GREEN}adminRizal123${NC}"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo -e "   View logs:     ${YELLOW}docker compose logs -f${NC}"
echo -e "   Stop:          ${YELLOW}docker compose down${NC}"
echo -e "   Restart:       ${YELLOW}docker compose restart${NC}"
echo -e "   Rebuild:       ${YELLOW}docker compose up -d --build${NC}"
echo ""
