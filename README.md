# Web Democracy

**Piattaforma web moderna per la democrazia partecipativa e la gestione di sondaggi con decisioni collettive.**

Web Democracy è un'applicazione completa che permette di creare, gestire e partecipare a sondaggi con un'interfaccia elegante e funzionalità avanzate per facilitare il processo decisionale democratico.

---

## 🚀 Tecnologie

### Backend
- **FastAPI** (Python) - Framework web moderno e performante
- **PostgreSQL** - Database relazionale robusto
- **SQLAlchemy** - ORM per gestione database
- **Pydantic** - Validazione dati e serializzazione

### Frontend
- **React 18** - Libreria UI moderna
- **TypeScript** - Tipizzazione statica
- **React Router** - Gestione routing
- **Lucide React** - Icone eleganti
- **QRCode.react** - Generazione QR code

### Infrastruttura
- **Docker Compose** - PostgreSQL containerizzato
- **Uvicorn** - Server ASGI ad alte prestazioni

---

## ✨ Funzionalità Principali

### 📊 Tipologie di Sondaggi

| Tipo | Descrizione | Icona |
|------|-------------|-------|
| **Scelta Singola** | Una sola risposta (radio button) | ☑️ |
| **Scelta Multipla** | Più risposte possibili (checkbox) | ☑️☑️ |
| **Rating** | Valutazione con stelle ⭐, cuori ❤️ o numeri | ⭐⭐⭐⭐⭐ |
| **Scala Numerica** | Valutazione da min a max con etichette personalizzabili | 1️⃣➡️🔟 |
| **Risposta Aperta** | Testo libero | 📝 |
| **Data** | Selezione date disponibili | 📅 |

### 🎯 Caratteristiche Avanzate

#### Opzioni Personalizzate
- Gli utenti possono **aggiungere nuove opzioni** durante la votazione
- Supporto per opzioni personalizzate in **tutti i tipi** di sondaggio
- Per rating/scale: l'utente vota contestualmente la nuova opzione proposta
- Per date: possibilità di proporre date alternative

#### Sistema di Tag
- **Categorizzazione** con tag colorati
- **8 tag predefiniti**: Tecnologia, Lavoro, Sport, Cultura, Cibo, Viaggi, Salute, Educazione
- **Filtri dinamici** per ricerca sondaggi

#### Gestione Voti
- **Prevenzione voti multipli** (via IP + session ID)
- **Voti multipli opzionali** (configurabile per sondaggio)
- **Tracking partecipanti** unici
- **Risultati in tempo reale** con statistiche

#### Rating e Feedback
- **Sistema di like** sui sondaggi (1-5 pallini verdi)
- **Commenti opzionali** per feedback qualitativo
- **Visualizzazione rating medio** per sondaggio

#### Statistiche Avanzate
- **Media, mediana, min/max** per valori numerici
- **Distribuzione valori** con grafici a barre
- **Percentuali di voto** per ogni opzione
- **Grafici visivi** per risultati immediati

#### Scadenza
- **Data e ora** di chiusura configurabili
- **Countdown** automatico
- **Filtri** per sondaggi attivi/scaduti

---

## 🎨 Design e UX

### Logo
Logo moderno e dinamico che rappresenta una **"W" tracciata come una pennellata**, simulando il gesto di firmare una spunta su un foglio di voto.

**Caratteristiche:**
- Stile minimal e professionale
- Effetto "baffo di penna" dinamico
- Colore primario: Indigo `#6366f1`
- 4 varianti: logo completo, small (navbar), icon, favicon

### Interfaccia Utente
- **Design moderno** con palette colori elegante
- **Layout responsive** per desktop e mobile
- **Card con ombre** leggere e border sottili
- **Animazioni fluide** per feedback visivo
- **Sidebar laterale** per filtri e navigazione

### Home Page
Layout a **due colonne** elegante:
- **Colonna sinistra**: Loghi Web Democracy, Databricks, TeamSystem con separatori
- **Colonna destra**: QR Code grande per accesso rapido

---

## 📁 Struttura Progetto

```
web-democracy/
├── backend/
│   ├── main.py              # API endpoints FastAPI
│   ├── models.py            # Modelli SQLAlchemy
│   ├── schemas.py           # Schemi Pydantic
│   ├── database.py          # Configurazione database
│   ├── requirements.txt     # Dipendenze Python
│   └── venv/               # Ambiente virtuale Python
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Componenti pagina
│   │   │   ├── Home.tsx
│   │   │   ├── SurveyList.tsx
│   │   │   ├── CreateSurvey.tsx
│   │   │   ├── SurveyDetail.tsx
│   │   │   ├── SurveyResults.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/     # Componenti riutilizzabili
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Loghi e risorse
│   ├── public/
│   │   ├── assets/logos/   # Loghi pubblici
│   │   └── favicon.svg     # Favicon
│   └── package.json
│
├── database/
│   └── init.sql            # Script inizializzazione database
│
├── docker-compose.yml       # Configurazione PostgreSQL
├── start-dev.sh            # Script avvio sviluppo
└── stop-dev.sh             # Script stop servizi
```

---

## 🛠️ Installazione e Avvio

### Prerequisiti
- **Python 3.10+**
- **Node.js 16+**
- **Docker & Docker Compose**
- **PostgreSQL** (via Docker)

### 🚀 Avvio Rapido

```bash
# 1. Avvia tutti i servizi (database, backend, frontend)
./start-dev.sh

# L'applicazione sarà disponibile su:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs

# 2. (Opzionale) Testa il deploy completo
./test-deploy.sh
```

### 📋 Avvio Manuale (Passo per Passo)

#### 1. Database PostgreSQL

```bash
# Avvia PostgreSQL con Docker
docker-compose up -d

# Verifica che sia in esecuzione
docker-compose ps

# (Opzionale) Inizializza database da zero
docker exec -i survey-app-postgres-1 psql -U survey_user -d survey_db < database/init.sql
```

#### 2. Backend FastAPI

```bash
cd backend

# Crea ambiente virtuale
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure
venv\Scripts\activate     # Windows

# Installa dipendenze
pip install -r requirements.txt

# Avvia server (sviluppo)
python main.py

# Il backend sarà su http://localhost:8000
```

#### 3. Frontend React

```bash
cd frontend

# Installa dipendenze
npm install

# Avvia server di sviluppo
npm start

# Il frontend sarà su http://localhost:3000
```

### 🛑 Stop Servizi

```bash
# Stop tutti i servizi
./stop-dev.sh
```

---

## 🗄️ Database

### Schema Principale

**8 Tabelle:**

1. **surveys** - Sondaggi con configurazioni
2. **survey_options** - Opzioni di risposta
3. **votes** - Voti degli utenti
4. **open_responses** - Risposte testuali
5. **survey_likes** - Rating e commenti sui sondaggi
6. **tags** - Tag per categorizzazione
7. **survey_tags** - Relazione many-to-many
8. **settings** - Impostazioni applicazione

### Enum Types

- **questiontype**: `single_choice`, `multiple_choice`, `open_text`, `scale`, `rating`, `date`

### Campi Chiave

- `question_type` - Tipo di domanda
- `min_value` / `max_value` - Range per scale/rating
- `rating_icon` - Icona rating: "star", "heart", "number"
- `allow_custom_options` - Permetti opzioni personalizzate
- `allow_multiple_responses` - Permetti voti multipli
- `expires_at` - Data/ora scadenza (UTC)
- `numeric_value` - Valore numerico per rating/scale
- `date_value` - Valore data per sondaggi date
- `option_id` - Collegamento opzione (per risposte multiple)

### Inizializzazione

```bash
# Reset completo database (ATTENZIONE: cancella tutti i dati!)
docker exec -i survey-app-postgres-1 psql -U survey_user -d survey_db < database/init.sql

# Include:
# - 6 sondaggi di esempio (uno per tipo)
# - 8 tag predefiniti
# - Setting QR code
# - Indici per performance ottimali
```

---

## 📊 API Endpoints

### Sondaggi

```
GET    /surveys              Lista tutti i sondaggi (con filtri)
POST   /surveys              Crea nuovo sondaggio
GET    /surveys/{id}         Dettagli sondaggio
DELETE /surveys/{id}         Elimina sondaggio
GET    /surveys/{id}/results Risultati con statistiche
POST   /surveys/{id}/vote    Vota in un sondaggio
```

#### Filtri Query Disponibili
- `?question_type=rating` - Filtra per tipo
- `?tag=Tecnologia` - Filtra per tag
- `?is_active=true` - Solo sondaggi attivi

### Tag

```
GET    /tags                 Lista tag
POST   /tags                 Crea tag
DELETE /tags/{id}            Elimina tag
```

### Like/Rating Sondaggi

```
POST   /surveys/{id}/like    Aggiungi rating al sondaggio
GET    /surveys/{id}/likes   Ottieni like statistiche
```

### Settings

```
GET    /settings/{key}       Ottieni impostazione
PUT    /settings/{key}       Aggiorna impostazione
```

### Documentazione Interattiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎯 Utilizzo

### Creare un Sondaggio

1. Vai su **"Crea Nuovo Sondaggio"**
2. Inserisci **titolo** e **descrizione** (opzionale)
3. Seleziona **tipologia** (pulsanti in riga)
4. Per **date**: usa selettori data invece di testo
5. Configura **opzioni specifiche**:
   - Rating: scegli icona (stelle/cuori/numeri) e range
   - Scala: imposta range e etichette min/max
   - Date: aggiungi date disponibili
6. Aggiungi **tag** (opzionale)
7. Imposta **scadenza** (opzionale)
8. Abilita **opzioni avanzate**:
   - Permetti opzioni personalizzate
   - Permetti voti multipli
   - Richiedi commento
9. Clicca **"Crea Sondaggio"**

### Partecipare a un Sondaggio

1. Seleziona un **sondaggio** dalla lista
2. **Rispondi** secondo il tipo:
   - Scelta singola: seleziona una opzione
   - Scelta multipla: seleziona più opzioni
   - Rating: valuta con stelle/cuori/numeri
   - Scala: usa slider per ogni opzione
   - Risposta aperta: scrivi testo libero
   - Data: seleziona data disponibile
3. (Opzionale) **Proponi opzione personalizzata**:
   - Per rating/scale: valuta contestualmente
   - Per date: proponi data alternativa
   - Per testo aperto: aggiungi nuovo campo
4. Aggiungi **commento** (se abilitato)
5. Clicca **"Conferma Voto"**

### Visualizzare Risultati

- **Grafici a barre** con percentuali
- **Statistiche numeriche** (media, mediana, min/max)
- **Opzione più votata** evidenziata
- **Distribuzione valori** per rating/scale
- **Tutte le risposte aperte** in lista
- **Date con voti** per sondaggi date
- **Commenti utenti** visibili
- **Opzioni personalizzate** incluse nei risultati

### Filtrare Sondaggi

Usa la **sidebar laterale** per filtrare:
- Per **tipologia** sondaggio
- Per **tag**
- Per **stato** (attivi/scaduti)

---

## 🔧 Configurazione

### Variabili Ambiente Backend

```bash
# File: backend/.env (opzionale)
DATABASE_URL=postgresql://survey_user:survey_password@localhost:5432/survey_db
```

### Configurazione Database

Default: `postgresql://survey_user:survey_password@localhost:5432/survey_db`

Per usare un database diverso:
```bash
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
python main.py
```

### Configurazione QR Code

Il QR Code nella home page può essere configurato via Settings:

```bash
# Via API
curl -X PUT http://localhost:8000/settings/qr_code_url \
  -H "Content-Type: application/json" \
  -d '{"value": "https://tuo-dominio.com"}'
```

O direttamente nel database:
```sql
UPDATE settings SET value = 'https://tuo-dominio.com' WHERE key = 'qr_code_url';
```

---

## 🐛 Troubleshooting

### Test rapido deploy

```bash
# Verifica che tutti i servizi siano attivi
./test-deploy.sh
```

### Backend non si avvia

```bash
# Verifica PostgreSQL
docker-compose ps

# Verifica credenziali
psql -U survey_user -d survey_db -h localhost

# Reinstalla dipendenze
pip install --force-reinstall -r requirements.txt
```

### Porta 5432 già in uso

```bash
# Verifica container PostgreSQL attivi
docker ps | grep postgres

# Ferma eventuali container conflittuali
docker stop <container-name>
docker rm <container-name>
```

### Frontend non si connette

```bash
# Verifica backend su porta 8000
curl http://localhost:8000/

# Pulisci cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Errori Database

```bash
# Reset database completo
docker-compose down -v
docker-compose up -d
sleep 5
docker exec -i survey-app-postgres-1 psql -U survey_user -d survey_db < database/init.sql
```

### Porta già in uso

```bash
# Backend (porta 8000)
lsof -ti:8000 | xargs kill -9

# Frontend (porta 3000)
lsof -ti:3000 | xargs kill -9
```

---

## 📱 Screenshot e Demo

### Home Page
Layout elegante a due colonne con loghi partner e QR Code

### Lista Sondaggi
Card moderne con tag colorati, filtri sidebar, statistiche rapide

### Creazione Sondaggio
Form intuitivo con selettori tipo a pulsanti, configurazioni avanzate

### Votazione
Interfaccia dinamica adattata al tipo di sondaggio

### Risultati
Grafici interattivi, statistiche complete, commenti utenti

---

## 🔐 Sicurezza

- **Prevenzione SQL Injection** via SQLAlchemy ORM
- **Validazione input** con Pydantic
- **Session tracking** per controllo voti
- **IP tracking** per anti-fraud
- **CORS** configurato per sicurezza
- **Prepared statements** per tutte le query

---

## 🚀 Deployment (Produzione)

### Backend

```bash
# Usa Gunicorn con Uvicorn workers
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend

```bash
# Build per produzione
npm run build

# Servi con Nginx o server statico
# La cartella build/ contiene i file statici
```

### Database

- Usa **PostgreSQL gestito** (AWS RDS, GCP Cloud SQL, etc.)
- Configura **backup automatici**
- Imposta **connessioni SSL**
- Usa **connection pooling**

### Variabili Ambiente Produzione

```bash
DATABASE_URL=postgresql://user:pass@prodhost:5432/dbname
ALLOWED_ORIGINS=https://tuodominio.com
```

---

## 📈 Performance

- **Indici database** su tutte le foreign key e campi ricerca
- **Query ottimizzate** con eager loading
- **Cache** per risultati frequenti (da implementare)
- **Compressione** response API
- **Lazy loading** componenti React

---

## 🤝 Contributi

Progetto sviluppato da **Web Democracy Team** in collaborazione con **Databricks** e **TeamSystem**.

---

## 📄 Licenza

Progetto interno - Tutti i diritti riservati

---

## 📞 Supporto

Per bug, domande o richieste di funzionalità, contattare il team di sviluppo.

---

**Versione:** 2.1  
**Ultimo aggiornamento:** 26 Ottobre 2025  
**Stack:** Python + FastAPI + PostgreSQL + React + TypeScript
