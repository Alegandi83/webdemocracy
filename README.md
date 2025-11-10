# Web Democracy

**Piattaforma web moderna per la democrazia partecipativa e la gestione di sondaggi con decisioni collettive.**

Web Democracy è un'applicazione completa che permette di creare, gestire e partecipare a sondaggi con un'interfaccia elegante e funzionalità avanzate per facilitare il processo decisionale democratico. 

Questa versione supporta **tre modalità di deployment**:
- **Locale**: PostgreSQL in Docker + applicazione locale
- **Ibrida**: Database su Databricks Lakebase + applicazione locale
- **Full Databricks**: Database su Lakebase + App su Databricks Apps

---

## 🌟 Caratteristiche Principali

### Modalità di Deployment

Web Democracy supporta **tre modalità di deployment** flessibili:

1. **💻 Locale**: PostgreSQL in Docker + applicazione locale (sviluppo)
2. **🔀 Ibrida**: Database su Databricks Lakebase + applicazione locale (testing)
3. **🚀 Full Databricks**: Database su Lakebase + App su Databricks Apps (produzione)

### Stack Tecnologico

- **Frontend**: React 18 + TypeScript
- **Backend**: FastAPI (Python)
- **Database**: Databricks Lakebase (PostgreSQL-compatibile)
- **Deployment**: Databricks Asset Bundles (DAB)
- **Authentication**: Databricks OAuth

---

## ✨ Funzionalità

### 📊 Tipologie di Sondaggi

| Tipo | Descrizione | Icona |
|------|-------------|-------|
| **Scelta Singola** | Una sola risposta (radio button) | ☑️ |
| **Scelta Multipla** | Più risposte possibili (checkbox) | ☑️☑️ |
| **Rating** | Valutazione con stelle ⭐, cuori ❤️ o numeri | ⭐⭐⭐⭐⭐ |
| **Scala Numerica** | Valutazione da min a max con etichette | 1️⃣➡️🔟 |
| **Risposta Aperta** | Testo libero | 📝 |
| **Data** | Selezione date disponibili | 📅 |

### 🎯 Caratteristiche Avanzate

- ✅ **Opzioni Personalizzate**: Gli utenti possono aggiungere nuove opzioni durante la votazione
- ✅ **Sistema di Tag**: 8 tag predefiniti con colori personalizzati
- ✅ **Prevenzione Voti Multipli**: Tracking via IP + session ID
- ✅ **Rating Sondaggi**: Sistema di like con 1-5 pallini verdi
- ✅ **Commenti**: Feedback qualitativo sui sondaggi
- ✅ **Statistiche Avanzate**: Media, mediana, distribuzione valori
- ✅ **Scadenza**: Data e ora di chiusura con countdown
- ✅ **Grafici Visivi**: Risultati in tempo reale

---

## 🚀 Quick Start

Scegli la modalità di deployment più adatta alle tue esigenze:

### Opzione 1: 💻 Modalità Locale (Sviluppo)

**Ideale per**: Sviluppo locale, test rapidi, nessuna dipendenza cloud

**Prerequisiti**:
- Python 3.10+
- Node.js 16+
- Docker & Docker Compose

**Avvio**:

```bash
# Avvia tutti i servizi (database, backend, frontend)
./start-dev.sh

# L'applicazione sarà disponibile su:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Database: PostgreSQL locale (Docker)
```

### Opzione 2: 🔀 Modalità Ibrida (Testing)

**Ideale per**: Testing con database cloud, sviluppo con Lakebase

**Prerequisiti**:
- Python 3.10+
- Node.js 16+
- Account Databricks con Lakebase abilitato
- Personal Access Token Databricks

**Avvio**:

```bash
# 1. Configura credenziali Databricks
cp env.lakebase.example .env.lakebase
nano .env.lakebase  # Inserisci le tue credenziali

# 2. Inizializza database su Lakebase (una sola volta)
# Esegui database/init.sql nel Databricks SQL Editor
# oppure lo script lo farà automaticamente se hai psql installato

# 3. Avvia applicazione con Lakebase
./start-dev-lakebase.sh

# L'applicazione sarà disponibile su:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Database: Databricks Lakebase (cloud)
```

### Opzione 3: 🚀 Full Databricks (Produzione)

**Ideale per**: Deploy in produzione, scalabilità, zero maintenance

**Prerequisiti**:
- Databricks CLI v0.267.0+
- Node.js 18+
- Account Databricks con Apps e Lakebase abilitati

**Deployment**:

```bash
# 1. Build del frontend
./build.sh

# 2. Valida la configurazione
databricks bundle validate -t dev

# 3. Deploy su Databricks
databricks bundle deploy -t dev

# 4. Avvia l'applicazione
databricks apps start webdemocracy-app
```

🎉 **Fatto!** L'app è disponibile su `https://webdemocracy-app-<workspace-id>.cloud.databricks.com`

### 🛑 Stop Servizi (Locale e Ibrida)

```bash
# Arresta tutti i servizi
./stop-dev.sh
```

---

## 📁 Struttura Progetto

```
webdem/
├── backend/
│   ├── app.py                  # FastAPI application (per Databricks Apps)
│   ├── main_local.py           # FastAPI application (per locale/ibrida)
│   ├── lakebase_connector.py   # Databricks Lakebase OAuth connection (solo Databricks)
│   ├── database.py             # Database config unificato (locale + ibrida)
│   ├── models.py               # SQLAlchemy models (unificato per tutte le modalità)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── requirements.txt        # Python dependencies (locale + ibrida)
│   ├── requirements-databricks.txt # Python dependencies (Full Databricks con OAuth)
│   ├── app.yml                 # App command configuration (Databricks)
│   └── static/                 # Built React frontend (per Databricks)
│
├── frontend/
│   ├── src/                    # React source code
│   │   ├── pages/              # Home, SurveyList, CreateSurvey, etc.
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript types
│   ├── public/                 # Public assets and logos
│   └── package.json            # npm dependencies
│
├── database/
│   ├── init.sql                # Init script (PostgreSQL & Lakebase)
│   ├── reset-database.sql      # Reset database
│   └── README.md               # Documentazione database
│
├── resources/                  # Configurazioni Databricks Apps
│   ├── database.yml            # Lakebase database configuration
│   └── app.yml                 # Databricks App configuration
│
├── docker-compose.yml          # PostgreSQL locale
├── databricks.yml              # Main DAB configuration (Full Databricks)
├── env.lakebase.example        # Template configurazione Lakebase
├── start-dev.sh                # Avvio modalità locale
├── start-dev-lakebase.sh       # Avvio modalità ibrida
├── stop-dev.sh                 # Stop servizi locali/ibridi
├── build.sh                    # Frontend build script (Databricks)
├── DEPLOYMENT_GUIDE.md         # Guida deployment dettagliata
├── PROJECT_SUMMARY.md          # Riepilogo progetto
├── QUICKSTART.md               # Guida rapida
└── README.md                   # Questo file
```

## 🌍 Confronto Modalità di Deployment

| Caratteristica | 💻 Locale | 🔀 Ibrida | 🚀 Full Databricks |
|----------------|-----------|-----------|-------------------|
| **Database** | Docker PostgreSQL | Lakebase | Lakebase |
| **Backend** | Locale (FastAPI) | Locale (FastAPI) | Databricks Apps |
| **Frontend** | Locale (React) | Locale (React) | Databricks Apps |
| **Authentication** | None | Token | OAuth |
| **Setup Time** | ⚡ 2 minuti | ⏱️ 5 minuti | 🕐 10 minuti |
| **Scalability** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | Alta | Media | Bassa |
| **Costo** | Gratuito | Cloud DB | Cloud Full |
| **Ideale per** | Development | Testing | Production |
| **Dipendenze** | Docker | Databricks | Databricks |
| **Connessione Internet** | No (opzionale) | Sì | Sì |
| **Hot Reload** | ✅ | ✅ | ❌ |

---

## 🗄️ Database Schema

Il database utilizza uno **schema dedicato `webdemocracy`** su Lakebase con:

### Tabelle Principali

1. **surveys** - Sondaggi con configurazioni
2. **survey_options** - Opzioni di risposta
3. **votes** - Voti degli utenti
4. **open_responses** - Risposte testuali
5. **survey_likes** - Rating e commenti sui sondaggi
6. **tags** - Tag per categorizzazione
7. **survey_tags** - Relazione many-to-many
8. **settings** - Impostazioni applicazione

### Inizializzazione Automatica

Al primo avvio, l'app automaticamente:
- ✅ Crea lo schema `webdemocracy`
- ✅ Crea tutte le tabelle con indici
- ✅ Inserisce 8 tag predefiniti
- ✅ Configura il QR code di default
- ✅ Garantisce permessi a tutti gli utenti

---

## 🔧 Architettura

### Backend (FastAPI)

- **OAuth Authentication**: Usa il token Databricks per connettersi a Lakebase
- **Static File Serving**: Serve il frontend React dalla cartella `static/`
- **SPA Routing**: Gestisce il routing di React Router
- **API Endpoints**: Prefissati con `/api/` per evitare conflitti

### Frontend (React)

- **React 18**: Con hooks e functional components
- **TypeScript**: Tipizzazione statica completa
- **React Router**: Client-side routing
- **Axios**: Client HTTP per chiamate API
- **Lucide Icons**: Icone moderne e responsive

### Database (Lakebase)

- **PostgreSQL-compatible**: Usa psycopg per la connessione
- **OAuth Token Authentication**: Password fornita dinamicamente
- **Schema Isolation**: Tutto in `webdemocracy` schema
- **Auto-initialization**: Schema creato al primo avvio

---

## 📊 API Endpoints

### Health & Metrics

```
GET    /api/health              Health check
GET    /metrics                 Metrics for monitoring
```

### Sondaggi

```
GET    /surveys                 Lista sondaggi (con filtri)
POST   /surveys                 Crea sondaggio
GET    /surveys/{id}            Dettagli sondaggio
PATCH  /surveys/{id}            Aggiorna sondaggio
DELETE /surveys/{id}            Elimina sondaggio
GET    /surveys/{id}/results    Risultati con statistiche
POST   /surveys/{id}/vote       Vota
GET    /surveys/{id}/stats      Statistiche dettagliate
```

### Tag

```
GET    /tags                    Lista tag
POST   /tags                    Crea tag
DELETE /tags/{id}               Elimina tag
```

### Like/Rating

```
POST   /surveys/{id}/like       Aggiungi rating
GET    /surveys/{id}/like       Ottieni rating utente
GET    /surveys/{id}/like/stats Statistiche rating
```

### Settings

```
GET    /settings/{key}          Ottieni setting
PUT    /settings/{key}          Aggiorna setting
```

---

## 🎨 Design & UX

### Logo

Logo moderno che rappresenta una **"W" tracciata come una pennellata**, simulando il gesto di firmare una spunta su un foglio di voto.

- Stile minimal e professionale
- Colore primario: Indigo `#6366f1`
- 4 varianti: completo, small, icon, favicon

### Interfaccia Utente

- Design moderno con palette elegante
- Layout responsive per desktop e mobile
- Card con ombre leggere
- Animazioni fluide
- Sidebar laterale per filtri

### Home Page

Layout a due colonne:
- **Sinistra**: Loghi Web Democracy, Databricks, TeamSystem
- **Destra**: QR Code grande per accesso rapido

---

## 📖 Documentazione

### Guide Complete

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guida dettagliata al deployment
  - Prerequisiti e setup
  - Deployment passo-passo
  - Troubleshooting
  - Monitoring e logs
  - Production deployment

### Reference

- [Databricks Apps Documentation](https://docs.databricks.com/en/apps/)
- [Databricks Lakebase Documentation](https://docs.databricks.com/en/lakebase/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## 🔄 Workflow di Sviluppo

### Sviluppo Locale

Per testare le modifiche localmente (usando Lakebase remoto):

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

### Deploy su Databricks

Dopo le modifiche:

```bash
# Se hai modificato il frontend
./build.sh

# Deploy
databricks bundle deploy -t dev

# Restart app
databricks apps restart webdemocracy-app
```

---

## 🌍 Differenze tra le Versioni

| Caratteristica | Locale | Ibrida | Full Databricks |
|----------------|--------|--------|-----------------|
| Database | Docker PostgreSQL | Lakebase | Lakebase |
| Backend | Locale (FastAPI) | Locale (FastAPI) | Databricks Apps |
| Frontend | Locale (React) | Locale (React) | Databricks Apps |
| Authentication | None | Token | OAuth |
| Scalability | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maintenance | Alta | Media | Bassa |
| Ideal For | Development | Testing | Production |

---

## 🎯 Use Cases

### Aziende

- ✅ Sondaggi di soddisfazione dipendenti
- ✅ Decisioni su benefit aziendali
- ✅ Feedback su iniziative interne
- ✅ Pianificazione eventi aziendali

### Comunità

- ✅ Votazioni su progetti comunitari
- ✅ Selezione date per incontri
- ✅ Raccolta opinioni su temi sociali
- ✅ Prioritizzazione iniziative

### Educazione

- ✅ Feedback su corsi
- ✅ Valutazione materiale didattico
- ✅ Organizzazione attività
- ✅ Sondaggi studenti

---

## 🛠️ Tecnologie e Librerie

### Backend

- **FastAPI** 0.115.4 - Web framework
- **SQLAlchemy** 2.0.41 - ORM
- **Pydantic** 2.12.3 - Data validation
- **psycopg** - PostgreSQL driver
- **databricks-sdk** - Databricks integration
- **uvicorn** - ASGI server

### Frontend

- **React** 18.2.0 - UI library
- **TypeScript** 4.9.5 - Type safety
- **React Router** 6.20.1 - Routing
- **Axios** 1.6.2 - HTTP client
- **Lucide React** 0.294.0 - Icons
- **QRCode.react** 3.1.0 - QR code generation

---

## 🔐 Sicurezza

- ✅ **OAuth Authentication**: Databricks OAuth per accesso al database
- ✅ **SQL Injection Prevention**: SQLAlchemy ORM con prepared statements
- ✅ **Input Validation**: Pydantic schemas
- ✅ **Session Tracking**: UUID-based sessions
- ✅ **IP Tracking**: Anti-fraud mechanism
- ✅ **CORS**: Configurabile per ambienti diversi

---

## 📈 Performance

- ✅ **Database Indexes**: Su tutte le foreign key e campi di ricerca
- ✅ **Connection Pooling**: Gestito da SQLAlchemy
- ✅ **Static File Serving**: Efficiente serving da FastAPI
- ✅ **Scalability**: Auto-scaling di Databricks Apps
- ✅ **Lakebase**: Managed PostgreSQL con alta disponibilità

---

## 🚧 Roadmap

### v2.2 (Prossimamente)

- [ ] Autenticazione utenti integrata con Databricks
- [ ] Dashboard amministratore avanzata
- [ ] Export risultati in Excel/CSV
- [ ] Notifiche via email
- [ ] API per integrazioni esterne
- [ ] Modalità offline per raccolta voti

### v3.0 (Futuro)

- [ ] Multi-lingua (i18n)
- [ ] Temi personalizzabili
- [ ] Workflow di approvazione sondaggi
- [ ] Analytics avanzati
- [ ] Mobile app (iOS/Android)
- [ ] Integrazione con Slack/Teams

---

## 🤝 Contributi

Progetto sviluppato in collaborazione con **Databricks** e **TeamSystem**.

---

## 📄 Licenza

Progetto interno - Tutti i diritti riservati

---

## 📞 Supporto

Per domande, problemi o richieste:

1. Consulta il [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Controlla i logs: `databricks apps logs webdemocracy-app`
3. Contatta il team di sviluppo
4. Consulta la documentazione Databricks

---

**Versione:** 2.1.0  
**Ultimo aggiornamento:** 8 Novembre 2025  
**Deployment**: Databricks Apps + Lakebase  
**Stack:** React + TypeScript + FastAPI + PostgreSQL

