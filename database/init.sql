-- ============================================================================
-- Web Democracy - Database Initialization Script
-- Versione: 3.0
-- Data: 9 Novembre 2025
-- ============================================================================
-- COMPATIBILITÀ: PostgreSQL locale e Databricks Lakebase
-- Lakebase è PostgreSQL-compatibile (porta 5432), usa la stessa sintassi SQL
-- NON confondere con SQL Warehouse (porta 443) che ha sintassi diversa
-- ============================================================================
-- IMPORTANTE: Tutte le tabelle vengono create nello schema 'webdemocracy'
-- Lo schema 'public' NON viene utilizzato
-- ============================================================================

-- Create schema for Lakebase deployments (ignored if not needed for local)
-- This ensures the webdemocracy schema exists before creating tables
CREATE SCHEMA IF NOT EXISTS webdemocracy;

-- Set search_path to use webdemocracy schema for all subsequent operations
SET search_path TO webdemocracy;

-- Drop tables if exist (in reverse order for foreign keys)
DROP TABLE IF EXISTS survey_likes CASCADE;
DROP TABLE IF EXISTS open_responses CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS survey_tags CASCADE;
DROP TABLE IF EXISTS survey_options CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TYPE IF EXISTS closuretype CASCADE;
DROP TYPE IF EXISTS questiontype CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Enum per i tipi di domanda (creato nello schema webdemocracy grazie a search_path)
CREATE TYPE questiontype AS ENUM (
    'single_choice',     -- Risposta singola (radio)
    'multiple_choice',   -- Risposte multiple (checkbox)
    'open_text',         -- Risposta aperta testuale
    'scale',             -- Scala numerica (es. 1-5, 1-10)
    'rating',            -- Rating a stelle/cuori/numeri
    'date'               -- Risposta data
);

-- Enum per i tipi di chiusura sondaggio
CREATE TYPE closuretype AS ENUM (
    'permanent',         -- Sondaggio permanente, sempre attivo
    'scheduled',         -- Scadenza fissata, si chiude automaticamente
    'manual'             -- Chiusura libera, chiudibile manualmente
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Tabella User (DEVE essere creata per prima perché altre tabelle la referenziano)
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE,
    profile_photo TEXT,  -- URL o base64 dell'immagine
    user_role VARCHAR(50) DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'pollster', 'editor')),
    gender VARCHAR(50),
    address_region VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'it',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actual_geolocation VARCHAR(255),  -- Coordinate GPS o località
    last_login_date TIMESTAMP WITH TIME ZONE,
    last_ip_address VARCHAR(45),  -- Supporta IPv4 e IPv6
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(user_role);

-- Tabella Tags per categorizzazione sondaggi
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',  -- Colore esadecimale
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha creato il tag (nullable per tag di sistema)
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- ============================================================================
-- NEWS TABLE
-- ============================================================================
CREATE TABLE news (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Author fields
    author VARCHAR(255),
    author_href TEXT,
    author_id VARCHAR(255),
    author_name VARCHAR(255),
    
    -- Content fields
    body TEXT,
    content TEXT,
    description TEXT,
    excerpt TEXT,
    headline VARCHAR(500),
    title VARCHAR(500),
    
    -- URL fields
    canonical_url TEXT,
    href TEXT,
    url TEXT,
    paywall_url TEXT,
    
    -- Media fields (JSON arrays)
    brands JSONB,
    images JSONB,
    videos JSONB,
    
    -- Classification fields (JSON arrays)
    categories JSONB,
    category VARCHAR(255),
    industries JSONB,
    keywords JSONB,
    keyword VARCHAR(255),
    topics JSONB,
    entities JSONB,
    locations JSONB,
    organizations JSONB,
    persons JSONB,
    
    -- Source fields
    source_id VARCHAR(255),
    source_name VARCHAR(255),
    source_href TEXT,
    source_location VARCHAR(255),
    source_rank INTEGER,
    source_categories JSONB,
    publisher VARCHAR(255),
    
    -- Metadata fields
    country VARCHAR(100),
    language VARCHAR(50),
    media VARCHAR(255),
    sentiment VARCHAR(50),
    
    -- Date fields
    date TIMESTAMP WITH TIME ZONE,
    publication_date TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    updated_last TIMESTAMP WITH TIME ZONE,
    
    -- Boolean flags
    is_breaking BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    is_paywall BOOLEAN DEFAULT FALSE,
    
    -- Related articles (JSON array)
    related_articles JSONB,
    
    -- Image field (single image URL)
    image TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for news table
CREATE INDEX idx_news_title ON news(title);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_source_name ON news(source_name);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_language ON news(language);
CREATE INDEX idx_news_is_breaking ON news(is_breaking);
CREATE INDEX idx_news_created_at ON news(created_at);

-- GIN indexes for JSONB fields (for efficient querying)
CREATE INDEX idx_news_categories_gin ON news USING gin(categories);
CREATE INDEX idx_news_keywords_gin ON news USING gin(keywords);
CREATE INDEX idx_news_topics_gin ON news USING gin(topics);

ANALYZE news;

-- ============================================================================
-- SURVEYS TABLE
-- ============================================================================
-- Tabella principale dei sondaggi
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    question_type questiontype DEFAULT 'single_choice' NOT NULL,
    
    -- Per domande di tipo scala/rating
    min_value INTEGER DEFAULT 1,
    max_value INTEGER DEFAULT 5,
    scale_min_label VARCHAR(100),      -- Es. "Molto insoddisfatto"
    scale_max_label VARCHAR(100),      -- Es. "Molto soddisfatto"
    
    -- Scadenza e validità
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closure_type closuretype DEFAULT 'permanent' NOT NULL,  -- Tipo di chiusura sondaggio
    expires_at TIMESTAMP WITH TIME ZONE,                    -- Utilizzato solo per closure_type='scheduled'
    is_active BOOLEAN DEFAULT TRUE,
    show_results_on_close BOOLEAN DEFAULT FALSE,            -- Mostra risultati solo dopo chiusura
    
    -- Opzioni
    allow_multiple_responses BOOLEAN DEFAULT FALSE,  -- Permetti voto multiplo dalla stessa persona
    allow_custom_options BOOLEAN DEFAULT FALSE,      -- Permetti aggiunta nuove opzioni
    require_comment BOOLEAN DEFAULT FALSE,           -- Richiedi commento
    rating_icon VARCHAR(20) DEFAULT 'star',         -- Icona per rating: "star", "heart", "number"
    is_anonymous BOOLEAN DEFAULT FALSE,             -- Sondaggio anonimo (non registra user_id dei partecipanti)
    
    -- Resource fields
    resource_type VARCHAR(20) DEFAULT 'none',       -- Tipo risorsa: 'none', 'url', 'news', 'image'
    resource_url TEXT,                              -- URL per link web o immagine caricata
    resource_news_id INTEGER REFERENCES news(id) ON DELETE SET NULL,  -- Riferimento a notizia
    
    -- Creatore del sondaggio
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_surveys_question_type ON surveys(question_type);
CREATE INDEX idx_surveys_closure_type ON surveys(closure_type);
CREATE INDEX idx_surveys_is_active ON surveys(is_active);
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_surveys_resource_type ON surveys(resource_type);
CREATE INDEX idx_surveys_resource_news_id ON surveys(resource_news_id);

-- Tabella opzioni di risposta
CREATE TABLE survey_options (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    option_order INTEGER DEFAULT 0,  -- Ordine di visualizzazione
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha creato l'opzione (nullable per opzioni create in sondaggi anonimi)
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_survey_options_survey_id ON survey_options(survey_id);
CREATE INDEX idx_survey_options_order ON survey_options(survey_id, option_order);
CREATE INDEX idx_survey_options_user_id ON survey_options(user_id);

-- Tabella associazione many-to-many Survey <-> Tag
CREATE TABLE survey_tags (
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,  -- Utente che ha creato l'associazione
    PRIMARY KEY (survey_id, tag_id)
);

CREATE INDEX idx_survey_tags_survey ON survey_tags(survey_id);
CREATE INDEX idx_survey_tags_tag ON survey_tags(tag_id);
CREATE INDEX idx_survey_tags_user_id ON survey_tags(user_id);

-- Tabella voti
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES survey_options(id) ON DELETE CASCADE,  -- Nullable per risposte aperte
    voter_ip VARCHAR(45),
    voter_session VARCHAR(100),  -- Session ID per tracciare risposte multiple
    
    -- Per risposte numeriche, scale, rating
    numeric_value DOUBLE PRECISION,
    date_value TIMESTAMP WITH TIME ZONE,
    
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha votato (nullable per supportare voti anonimi)
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_votes_survey_id ON votes(survey_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_session ON votes(voter_session);
CREATE INDEX idx_votes_ip ON votes(voter_ip);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Tabella risposte aperte testuali
CREATE TABLE open_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES survey_options(id) ON DELETE CASCADE,  -- Opzionale per compatibilità
    voter_ip VARCHAR(45),
    voter_session VARCHAR(100),
    response_text TEXT NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha risposto (nullable per supportare risposte anonime)
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_open_responses_survey_id ON open_responses(survey_id);
CREATE INDEX idx_open_responses_option_id ON open_responses(option_id);
CREATE INDEX idx_open_responses_session ON open_responses(voter_session);
CREATE INDEX idx_open_responses_responded_at ON open_responses(responded_at DESC);
CREATE INDEX idx_open_responses_user_id ON open_responses(user_id);

-- Tabella likes/ratings sui sondaggi
CREATE TABLE survey_likes (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    user_session VARCHAR(100),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- 1-5 pallini verdi
    comment TEXT,  -- Commento opzionale sul sondaggio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha messo il like (nullable per supportare like anonimi)
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_survey_likes_survey_id ON survey_likes(survey_id);
CREATE INDEX idx_survey_likes_session ON survey_likes(user_session);
CREATE INDEX idx_survey_likes_created_at ON survey_likes(created_at DESC);
CREATE INDEX idx_survey_likes_user_id ON survey_likes(user_id);

-- Tabella impostazioni generali
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);

-- Tabella gruppi
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Utente che ha creato il gruppo
    created_by INTEGER REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_groups_name ON groups(name);
CREATE INDEX idx_groups_created_by ON groups(created_by);

-- Tabella associazione utenti-gruppi (many-to-many)
CREATE TABLE user_groups (
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, group_id)
);

CREATE INDEX idx_user_groups_user_id ON user_groups(user_id);
CREATE INDEX idx_user_groups_group_id ON user_groups(group_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Utenti di esempio (DEVONO essere creati per primi)
INSERT INTO "user" (name, email, user_role, preferred_language, gender, address_region) VALUES 
    ('Demo User', 'demo@local.dev', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
    ('Alessandro Gandini', 'alessandro.gandini@databricks.com', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
    ('Pollster User', 'pollster@webdemocracy.com', 'pollster', 'it', 'Preferisco non specificare', 'Italia');

-- Gruppi di esempio
INSERT INTO groups (name, description, created_by) VALUES 
    ('Amministratori', 'Gruppo degli amministratori del sistema', 1),
    ('Team Marketing', 'Team responsabile delle attività di marketing', 1),
    ('Utenti Beta', 'Gruppo di utenti che testano le nuove funzionalità', 1);

-- Associazioni utenti-gruppi di esempio
INSERT INTO user_groups (user_id, group_id) VALUES 
    (1, 1),  -- Demo User -> Amministratori
    (2, 1),  -- Alessandro -> Amministratori
    (1, 3),  -- Demo User -> Utenti Beta
    (3, 2);  -- Pollster -> Team Marketing

-- Tag predefiniti (creati dall'utente Demo User - id=1)
INSERT INTO tags (name, color, user_id) VALUES 
    ('Tecnologia', '#6366f1', NULL),  -- Tag di sistema (NULL = sistema)
    ('Lavoro', '#8b5cf6', NULL),
    ('Sport', '#10b981', NULL),
    ('Cultura', '#ec4899', NULL),
    ('Cibo', '#f59e0b', NULL),
    ('Viaggi', '#14b8a6', NULL),
    ('Salute', '#ef4444', NULL),
    ('Educazione', '#3b82f6', NULL);

-- Impostazione URL per QR Code
-- NOTA: Il valore di default viene preso dalla variabile d'ambiente DATABRICKS_APP_URL
-- Gli admin possono modificarlo dalla pagina Impostazioni > Gestione URL
-- INSERT INTO settings (key, value) VALUES ('qr_code_url', 'http://localhost:3000');

-- Sondaggio di esempio 1: Scelta Singola (creato da Demo User - id=1)
INSERT INTO surveys (
    title, 
    description, 
    question_type,
    closure_type,
    allow_custom_options,
    user_id
) VALUES (
    'Qual è il tuo linguaggio di programmazione preferito?',
    'Aiutaci a capire le preferenze della community di sviluppatori',
    'single_choice',
    'permanent',
    true,
    1
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (1, 'Python', 0, 1),
    (1, 'JavaScript', 1, 1),
    (1, 'TypeScript', 2, 1),
    (1, 'Java', 3, 1),
    (1, 'Go', 4, 1),
    (1, 'Rust', 5, 1);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (1, 1, 1);  -- Tag "Tecnologia"

-- Sondaggio di esempio 2: Rating (creato da Pollster User - id=3) - Chiusura manuale
INSERT INTO surveys (
    title,
    description,
    question_type,
    closure_type,
    min_value,
    max_value,
    rating_icon,
    allow_custom_options,
    user_id
) VALUES (
    'Valuta i nostri servizi',
    'Aiutaci a migliorare valutando diversi aspetti del nostro servizio',
    'rating',
    'manual',
    1,
    5,
    'star',
    true,
    3
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (2, 'Qualità del servizio', 0, 3),
    (2, 'Velocità di risposta', 1, 3),
    (2, 'Professionalità', 2, 3),
    (2, 'Rapporto qualità/prezzo', 3, 3);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (2, 2, 3);  -- Tag "Lavoro"

-- Sondaggio di esempio 3: Scala Numerica (creato da Alessandro Gandini - id=2) - Con scadenza fissata
INSERT INTO surveys (
    title,
    description,
    question_type,
    closure_type,
    expires_at,
    min_value,
    max_value,
    scale_min_label,
    scale_max_label,
    allow_custom_options,
    user_id
) VALUES (
    'Quanto sei soddisfatto del tuo lavoro attuale?',
    'Valuta il tuo livello di soddisfazione su una scala da 1 a 10',
    'scale',
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    1,
    10,
    'Per niente soddisfatto',
    'Completamente soddisfatto',
    false,
    2
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (3, 'Ambiente di lavoro', 0, 2),
    (3, 'Stipendio e benefit', 1, 2),
    (3, 'Opportunità di crescita', 2, 2);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (3, 2, 2);  -- Tag "Lavoro"

-- Sondaggio di esempio 4: Scelta Multipla (creato da Demo User - id=1) - Permanente
INSERT INTO surveys (
    title,
    description,
    question_type,
    closure_type,
    allow_custom_options,
    user_id
) VALUES (
    'Quali sport pratichi regolarmente?',
    'Puoi selezionare più opzioni',
    'multiple_choice',
    'permanent',
    true,
    1
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (4, 'Calcio', 0, 1),
    (4, 'Tennis', 1, 1),
    (4, 'Nuoto', 2, 1),
    (4, 'Palestra', 3, 1),
    (4, 'Corsa', 4, 1),
    (4, 'Ciclismo', 5, 1);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (4, 3, 1);  -- Tag "Sport"

-- Sondaggio di esempio 5: Data (creato da Pollster User - id=3) - Con scadenza fissata
INSERT INTO surveys (
    title,
    description,
    question_type,
    closure_type,
    expires_at,
    allow_custom_options,
    user_id
) VALUES (
    'Quando sei disponibile per il team meeting?',
    'Seleziona la data che preferisci o proponi una nuova data',
    'date',
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    true,
    3
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (5, '2024-11-15', 0, 3),
    (5, '2024-11-16', 1, 3),
    (5, '2024-11-17', 2, 3);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (5, 2, 3);  -- Tag "Lavoro"

-- Sondaggio di esempio 6: Risposta Aperta (creato da Alessandro Gandini - id=2) - Chiusura manuale
INSERT INTO surveys (
    title,
    description,
    question_type,
    closure_type,
    allow_custom_options,
    user_id
) VALUES (
    'Suggerimenti per migliorare Web Democracy',
    'Condividi le tue idee e suggerimenti',
    'open_text',
    'manual',
    true,
    2
);

INSERT INTO survey_options (survey_id, option_text, option_order, user_id) VALUES 
    (6, 'Funzionalità mancanti', 0, 2),
    (6, 'Miglioramenti UI/UX', 1, 2),
    (6, 'Performance e velocità', 2, 2);

INSERT INTO survey_tags (survey_id, tag_id, user_id) VALUES (6, 1, 2);  -- Tag "Tecnologia"

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE surveys IS 'Tabella principale dei sondaggi con tutte le configurazioni';
COMMENT ON TABLE survey_options IS 'Opzioni di risposta per i sondaggi';
COMMENT ON TABLE votes IS 'Voti degli utenti con supporto per valori numerici e date';
COMMENT ON TABLE open_responses IS 'Risposte aperte testuali degli utenti';
COMMENT ON TABLE survey_likes IS 'Rating e commenti sui sondaggi';
COMMENT ON TABLE tags IS 'Tag per categorizzare i sondaggi';
COMMENT ON TABLE survey_tags IS 'Associazione many-to-many tra sondaggi e tag';
COMMENT ON TABLE settings IS 'Impostazioni generali dell''applicazione';

COMMENT ON COLUMN surveys.question_type IS 'Tipo di domanda: single_choice, multiple_choice, open_text, scale, rating, date';
COMMENT ON COLUMN surveys.rating_icon IS 'Icona per il rating: star, heart, number';
COMMENT ON COLUMN surveys.allow_custom_options IS 'Permette agli utenti di aggiungere nuove opzioni';
COMMENT ON COLUMN votes.numeric_value IS 'Valore numerico per scale e rating';
COMMENT ON COLUMN votes.date_value IS 'Valore data per sondaggi di tipo date';
COMMENT ON COLUMN survey_likes.rating IS 'Rating 1-5 sul sondaggio (pallini verdi)';

-- ============================================================================
-- STATISTICS
-- ============================================================================

-- Aggiorna le statistiche per performance ottimali
ANALYZE surveys;
ANALYZE survey_options;
ANALYZE votes;
ANALYZE open_responses;
ANALYZE survey_likes;
ANALYZE tags;
ANALYZE survey_tags;
ANALYZE settings;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Web Democracy Database Initialized!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: 12';
    RAISE NOTICE 'Sample surveys: 6';
    RAISE NOTICE 'Tags: 8';
    RAISE NOTICE 'News examples: 10';
    RAISE NOTICE 'Version: 2.5';
    RAISE NOTICE 'Schema: webdemocracy (ALWAYS)';
    RAISE NOTICE 'Compatible: PostgreSQL & Databricks Lakebase';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

