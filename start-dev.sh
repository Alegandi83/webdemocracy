#!/bin/bash

# Script per avviare Web Democracy in ambiente di sviluppo
# Uso: ./start-dev.sh

echo "🚀 Avvio Web Democracy in modalità sviluppo..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per verificare se un comando esiste
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica prerequisiti
echo -e "${BLUE}📋 Verifica prerequisiti...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker non trovato. Installare Docker prima di continuare.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose non trovato. Installare Docker Compose prima di continuare.${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 non trovato. Installare Python 3.8+ prima di continuare.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm non trovato. Installare Node.js e npm prima di continuare.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tutti i prerequisiti sono soddisfatti${NC}"

# Avvia PostgreSQL
echo -e "${BLUE}🐘 Avvio PostgreSQL con Docker...${NC}"
docker-compose up -d

# Attendi che PostgreSQL sia pronto
echo -e "${YELLOW}⏳ Attendo che PostgreSQL sia pronto...${NC}"
sleep 10

# Verifica che PostgreSQL sia in esecuzione
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Errore nell'avvio di PostgreSQL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL avviato con successo${NC}"

# Setup Backend
echo -e "${BLUE}🐍 Configurazione Backend FastAPI...${NC}"
cd backend

# Crea ambiente virtuale se non esiste
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creazione ambiente virtuale Python...${NC}"
    python3 -m venv venv
fi

# Attiva ambiente virtuale
echo -e "${YELLOW}🔄 Attivazione ambiente virtuale...${NC}"
source venv/bin/activate

# Installa dipendenze
echo -e "${YELLOW}📥 Installazione dipendenze Python...${NC}"
pip install -r requirements.txt

# Avvia backend in background
echo -e "${BLUE}🚀 Avvio Backend FastAPI...${NC}"
python main.py &
BACKEND_PID=$!

# Torna alla directory principale
cd ..

# Setup Frontend
echo -e "${BLUE}⚛️  Configurazione Frontend React...${NC}"
cd frontend

# Installa dipendenze npm se non esistono
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installazione dipendenze npm...${NC}"
    npm install
fi

# Avvia frontend in background
echo -e "${BLUE}🚀 Avvio Frontend React...${NC}"
npm start &
FRONTEND_PID=$!

# Torna alla directory principale
cd ..

# Informazioni finali
echo ""
echo -e "${GREEN}🎉 Web Democracy avviata con successo!${NC}"
echo ""
echo -e "${BLUE}📍 Servizi disponibili:${NC}"
echo -e "   🌐 Frontend React: ${YELLOW}http://localhost:3000${NC}"
echo -e "   🔧 Backend FastAPI: ${YELLOW}http://localhost:8000${NC}"
echo -e "   📚 Documentazione API: ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "   🐘 Database PostgreSQL: ${YELLOW}localhost:5432${NC}"
echo ""
echo -e "${BLUE}🛑 Per fermare i servizi:${NC}"
echo -e "   - Premi ${YELLOW}Ctrl+C${NC} in questo terminale"
echo -e "   - O esegui: ${YELLOW}./stop-dev.sh${NC}"
echo ""

# Funzione per cleanup quando si esce
cleanup() {
    echo -e "\n${YELLOW}🛑 Arresto servizi...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servizi arrestati${NC}"
}

# Trap per cleanup su exit
trap cleanup EXIT

# Mantieni lo script in esecuzione
wait
