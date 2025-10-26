#!/bin/bash

# Script per testare il deploy di Web Democracy

echo ""
echo "========================================="
echo "🧪 TEST DEPLOY WEB DEMOCRACY"
echo "========================================="
echo ""

# Test 1: PostgreSQL
echo "1️⃣  Database PostgreSQL..."
docker ps | grep webdemocracy-postgres-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    SURVEY_COUNT=$(docker exec webdemocracy-postgres-1 psql -U survey_user -d survey_db -t -c "SELECT COUNT(*) FROM surveys" 2>/dev/null | xargs)
    echo "   ✅ PostgreSQL attivo ($SURVEY_COUNT sondaggi nel database)"
else
    echo "   ❌ PostgreSQL non attivo"
    exit 1
fi

# Test 2: Backend FastAPI
echo ""
echo "2️⃣  Backend FastAPI (http://localhost:8000)..."
BACKEND_RESPONSE=$(curl -s http://localhost:8000/ 2>/dev/null)
if [ $? -eq 0 ] && [[ $BACKEND_RESPONSE == *"Web Democracy API"* ]]; then
    echo "   ✅ Backend attivo e risponde correttamente"
    SURVEYS_API=$(curl -s http://localhost:8000/surveys 2>/dev/null | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
    echo "   ✅ API /surveys ritorna $SURVEYS_API sondaggi"
else
    echo "   ❌ Backend non risponde"
    exit 1
fi

# Test 3: Frontend React
echo ""
echo "3️⃣  Frontend React (http://localhost:3000)..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000/ 2>/dev/null)
if [ $? -eq 0 ] && [[ $FRONTEND_RESPONSE == *"Web Democracy"* ]]; then
    echo "   ✅ Frontend attivo e risponde correttamente"
else
    echo "   ❌ Frontend non risponde"
    exit 1
fi

# Riepilogo
echo ""
echo "========================================="
echo "✅ DEPLOY COMPLETO RIUSCITO!"
echo "========================================="
echo ""
echo "📍 Servizi disponibili:"
echo "   🌐 Frontend:   http://localhost:3000"
echo "   🔧 Backend:    http://localhost:8000"
echo "   📚 API Docs:   http://localhost:8000/docs"
echo "   🐘 Database:   localhost:5432"
echo ""
echo "🛑 Per fermare i servizi:"
echo "   ./stop-dev.sh"
echo ""

