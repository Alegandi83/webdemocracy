#!/bin/bash

# Script per avviare Web Democracy con Databricks Lakebase
# Uso: ./start-dev-lakebase.sh

echo "🚀 Avvio Web Democracy con Databricks Lakebase..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funzione per verificare se un comando esiste
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica prerequisiti
echo -e "${BLUE}📋 Verifica prerequisiti...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 non trovato. Installare Python 3.8+ prima di continuare.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm non trovato. Installare Node.js e npm prima di continuare.${NC}"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  psql non trovato. L'inizializzazione automatica del database non sarà disponibile.${NC}"
    echo -e "${YELLOW}   Dovrai eseguire manualmente lo script database/init.sql${NC}"
    PSQL_AVAILABLE=false
else
    PSQL_AVAILABLE=true
fi

echo -e "${GREEN}✅ Tutti i prerequisiti sono soddisfatti${NC}"

# Verifica file .env.lakebase
if [ ! -f ".env.lakebase" ]; then
    echo -e "${RED}❌ File .env.lakebase non trovato!${NC}"
    echo -e "${YELLOW}Crea il file .env.lakebase copiando env.lakebase.example:${NC}"
    echo -e "   cp env.lakebase.example .env.lakebase"
    echo -e "   # Modifica .env.lakebase con le tue credenziali Databricks"
    exit 1
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🗄️  MODALITÀ: DATABRICKS LAKEBASE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Setup Backend
echo -e "${BLUE}🐍 Configurazione Backend FastAPI con Lakebase...${NC}"
cd backend

# Crea ambiente virtuale se non esiste
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creazione ambiente virtuale Python...${NC}"
    python3 -m venv venv
fi

# Attiva ambiente virtuale
echo -e "${YELLOW}🔄 Attivazione ambiente virtuale...${NC}"
source venv/bin/activate

# Installa dipendenze (requirements.txt è ora unificato per local + hybrid)
echo -e "${YELLOW}📥 Installazione dipendenze Python...${NC}"
pip install -r requirements.txt --quiet

# Testa connessione a Lakebase
echo -e "${CYAN}🔍 Test connessione a Databricks Lakebase...${NC}"
export DEPLOY_MODE=hybrid
USE_LAKEBASE=true python3 -c "
import sys
sys.path.insert(0, '.')
from database import test_connection
if not test_connection():
    print('❌ Impossibile connettersi a Databricks Lakebase')
    print('Verifica le credenziali nel file .env.lakebase')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Test connessione fallito. Controlla il file .env.lakebase${NC}"
    exit 1
fi

# Inizializza database con script SQL
if [ "$PSQL_AVAILABLE" = true ]; then
    echo -e "${CYAN}🗄️  Inizializzazione database...${NC}"
    
    # Carica variabili da .env.lakebase
    source ../.env.lakebase
    
    # Costruisci connection string PostgreSQL
    export PGPASSWORD="$LAKEBASE_PASSWORD"
    export PGOPTIONS="-c search_path=${LAKEBASE_SCHEMA:-public}"
    
    # Esegui lo script init.sql (compatibile con Lakebase)
    echo -e "${YELLOW}📝 Esecuzione script init.sql su schema: ${LAKEBASE_SCHEMA:-public}${NC}"
    psql -h "$LAKEBASE_HOST" \
         -p "$LAKEBASE_PORT" \
         -U "$LAKEBASE_USER" \
         -d "$LAKEBASE_DATABASE" \
         -f ../database/init.sql \
         -v ON_ERROR_STOP=1 \
         --set=sslmode="$LAKEBASE_SSLMODE" \
         2>&1 | grep -v "NOTICE:" | grep -v "already exists"
    
    INIT_EXIT_CODE=$?
    
    # Pulisci variabili dall'ambiente
    unset PGPASSWORD
    unset PGOPTIONS
    
    if [ $INIT_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Database inizializzato correttamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Alcuni errori durante l'inizializzazione (potrebbero essere normali se le tabelle esistono già)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Inizializzazione automatica saltata. Esegui manualmente:${NC}"
    echo -e "   psql -h \$LAKEBASE_HOST -U \$LAKEBASE_USER -d \$LAKEBASE_DATABASE -f database/init.sql"
fi

# Database unificato: database.py gestisce automaticamente local e hybrid
echo -e "${GREEN}✅ Database configurato per Lakebase (hybrid mode)${NC}"
echo -e "${CYAN}   database.py userà automaticamente Lakebase con USE_LAKEBASE=true${NC}"

# Avvia backend in background con DEPLOY_MODE
echo -e "${BLUE}🚀 Avvio Backend FastAPI (modalità ibrida)...${NC}"
export DEPLOY_MODE=hybrid
USE_LAKEBASE=true python main_local.py &
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
echo -e "${GREEN}🎉 Web Democracy avviata con Databricks Lakebase!${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📍 Servizi disponibili:${NC}"
echo -e "   🌐 Frontend React:      ${YELLOW}http://localhost:3000${NC}"
echo -e "   🔧 Backend FastAPI:     ${YELLOW}http://localhost:8000${NC}"
echo -e "   📚 Documentazione API:  ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "   🗄️  Database:            ${YELLOW}Databricks Lakebase${NC}"
echo ""
echo -e "${BLUE}🛑 Per fermare i servizi:${NC}"
echo -e "   - Premi ${YELLOW}Ctrl+C${NC} in questo terminale"
echo -e "   - O esegui: ${YELLOW}./stop-dev.sh${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Funzione per cleanup quando si esce
cleanup() {
    echo -e "\n${YELLOW}🛑 Arresto servizi...${NC}"
    
    # Termina processi
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servizi arrestati${NC}"
}

# Trap per cleanup su exit
trap cleanup EXIT

# Mantieni lo script in esecuzione
wait

