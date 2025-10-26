#!/bin/bash

# Script per fermare Web Democracy
# Uso: ./stop-dev.sh

echo "🛑 Arresto Web Democracy..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ferma processi Python (FastAPI)
echo -e "${YELLOW}🐍 Arresto Backend FastAPI...${NC}"
pkill -f "python main.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

# Ferma processi Node.js (React)
echo -e "${YELLOW}⚛️  Arresto Frontend React...${NC}"
pkill -f "react-scripts" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# Ferma PostgreSQL
echo -e "${YELLOW}🐘 Arresto PostgreSQL...${NC}"
docker-compose down

echo -e "${GREEN}✅ Web Democracy arrestata completamente${NC}"
echo ""
echo -e "${BLUE}📋 Per riavviare l'app esegui: ${YELLOW}./start-dev.sh${NC}"
