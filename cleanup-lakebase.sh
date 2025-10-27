#!/bin/bash

# Script per eliminare tutte le tabelle dal database Databricks Lakebase
# Uso: ./cleanup-lakebase.sh

echo "⚠️  ATTENZIONE: Questo script eliminerà TUTTI i dati dal database Lakebase!"
echo ""
echo "   Database: Databricks Lakebase"
echo "   Schema: webdem (o quello configurato in .env.lakebase)"
echo ""
echo "Questa operazione è IRREVERSIBILE."
echo ""

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
if ! command_exists psql; then
    echo -e "${RED}❌ psql non trovato. Installare PostgreSQL client prima di continuare.${NC}"
    exit 1
fi

# Verifica file .env.lakebase
if [ ! -f ".env.lakebase" ]; then
    echo -e "${RED}❌ File .env.lakebase non trovato!${NC}"
    echo -e "${YELLOW}Assicurati di essere nella directory webdemocracy${NC}"
    exit 1
fi

# Conferma dall'utente
read -p "Sei SICURO di voler procedere? Digita 'ELIMINA' per confermare: " confirmation

if [ "$confirmation" != "ELIMINA" ]; then
    echo -e "${YELLOW}❌ Operazione annullata.${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🗄️  ELIMINAZIONE DATABASE LAKEBASE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Carica variabili da .env.lakebase
source .env.lakebase

# Verifica che le variabili siano impostate
if [ -z "$LAKEBASE_HOST" ] || [ -z "$LAKEBASE_USER" ] || [ -z "$LAKEBASE_PASSWORD" ]; then
    echo -e "${RED}❌ Credenziali Lakebase mancanti nel file .env.lakebase${NC}"
    exit 1
fi

echo -e "${BLUE}📡 Connessione a Databricks Lakebase...${NC}"
echo -e "   Host: ${LAKEBASE_HOST}"
echo -e "   Database: ${LAKEBASE_DATABASE}"
echo -e "   Schema: ${LAKEBASE_SCHEMA}"
echo ""

# Imposta password per psql
export PGPASSWORD="$LAKEBASE_PASSWORD"

# Esegui lo script drop-lakebase.sql
echo -e "${YELLOW}🗑️  Esecuzione script drop-lakebase.sql...${NC}"
echo -e "${YELLOW}   Schema target: ${LAKEBASE_SCHEMA:-public}${NC}"
echo ""

# NOTA: Lo schema viene impostato direttamente nello script SQL
psql -h "$LAKEBASE_HOST" \
     -p "$LAKEBASE_PORT" \
     -U "$LAKEBASE_USER" \
     -d "$LAKEBASE_DATABASE" \
     -v ON_ERROR_STOP=1 \
     --set=sslmode="$LAKEBASE_SSLMODE" \
     -f database/drop-lakebase.sql \
     2>&1

DROP_EXIT_CODE=$?

# Pulisci variabili dall'ambiente
unset PGPASSWORD
unset PGOPTIONS

echo ""
if [ $DROP_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Database Lakebase eliminato con successo${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Prossimi passi (opzionali):${NC}"
    echo ""
    echo -e "   1. Reinizializza il database:"
    echo -e "      ${YELLOW}./start-dev-lakebase.sh${NC}"
    echo ""
    echo -e "   2. Oppure esegui manualmente lo script di inizializzazione:"
    echo -e "      ${YELLOW}psql ... -f database/init-lakebase.sql${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}❌ Errore durante l'eliminazione del database${NC}"
    echo -e "${YELLOW}Controlla i messaggi di errore sopra${NC}"
    exit 1
fi

