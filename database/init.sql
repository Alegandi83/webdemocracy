-- ============================================================================
-- Web Democracy - Database Initialization Script
-- Versione: 2.1
-- Data: 26 Ottobre 2025
-- ============================================================================

-- Drop tables if exist (in reverse order for foreign keys)
DROP TABLE IF EXISTS survey_likes CASCADE;
DROP TABLE IF EXISTS open_responses CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS survey_tags CASCADE;
DROP TABLE IF EXISTS survey_options CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TYPE IF EXISTS questiontype CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Enum per i tipi di domanda
CREATE TYPE questiontype AS ENUM (
    'single_choice',     -- Risposta singola (radio)
    'multiple_choice',   -- Risposte multiple (checkbox)
    'open_text',         -- Risposta aperta testuale
    'scale',             -- Scala numerica (es. 1-5, 1-10)
    'rating',            -- Rating a stelle/cuori/numeri
    'date'               -- Risposta data
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Tabella Tags per categorizzazione sondaggi
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',  -- Colore esadecimale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);

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
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Opzioni
    allow_multiple_responses BOOLEAN DEFAULT FALSE,  -- Permetti voto multiplo dalla stessa persona
    allow_custom_options BOOLEAN DEFAULT FALSE,      -- Permetti aggiunta nuove opzioni
    require_comment BOOLEAN DEFAULT FALSE,           -- Richiedi commento
    rating_icon VARCHAR(20) DEFAULT 'star'          -- Icona per rating: "star", "heart", "number"
);

CREATE INDEX idx_surveys_question_type ON surveys(question_type);
CREATE INDEX idx_surveys_is_active ON surveys(is_active);
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC);

-- Tabella opzioni di risposta
CREATE TABLE survey_options (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    option_order INTEGER DEFAULT 0,  -- Ordine di visualizzazione
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_survey_options_survey_id ON survey_options(survey_id);
CREATE INDEX idx_survey_options_order ON survey_options(survey_id, option_order);

-- Tabella associazione many-to-many Survey <-> Tag
CREATE TABLE survey_tags (
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (survey_id, tag_id)
);

CREATE INDEX idx_survey_tags_survey ON survey_tags(survey_id);
CREATE INDEX idx_survey_tags_tag ON survey_tags(tag_id);

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
    
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_votes_survey_id ON votes(survey_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_session ON votes(voter_session);
CREATE INDEX idx_votes_ip ON votes(voter_ip);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);

-- Tabella risposte aperte testuali
CREATE TABLE open_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES survey_options(id) ON DELETE CASCADE,  -- Opzionale per compatibilità
    voter_ip VARCHAR(45),
    voter_session VARCHAR(100),
    response_text TEXT NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_open_responses_survey_id ON open_responses(survey_id);
CREATE INDEX idx_open_responses_option_id ON open_responses(option_id);
CREATE INDEX idx_open_responses_session ON open_responses(voter_session);
CREATE INDEX idx_open_responses_responded_at ON open_responses(responded_at DESC);

-- Tabella likes/ratings sui sondaggi
CREATE TABLE survey_likes (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    user_session VARCHAR(100),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- 1-5 pallini verdi
    comment TEXT,  -- Commento opzionale sul sondaggio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_survey_likes_survey_id ON survey_likes(survey_id);
CREATE INDEX idx_survey_likes_session ON survey_likes(user_session);
CREATE INDEX idx_survey_likes_created_at ON survey_likes(created_at DESC);

-- Tabella impostazioni generali
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Tag predefiniti
INSERT INTO tags (name, color) VALUES 
    ('Tecnologia', '#6366f1'),
    ('Lavoro', '#8b5cf6'),
    ('Sport', '#10b981'),
    ('Cultura', '#ec4899'),
    ('Cibo', '#f59e0b'),
    ('Viaggi', '#14b8a6'),
    ('Salute', '#ef4444'),
    ('Educazione', '#3b82f6');

-- Impostazione URL per QR Code (default)
INSERT INTO settings (key, value) VALUES 
    ('qr_code_url', 'http://localhost:3000');

-- Sondaggio di esempio 1: Scelta Singola
INSERT INTO surveys (
    title, 
    description, 
    question_type,
    allow_custom_options
) VALUES (
    'Qual è il tuo linguaggio di programmazione preferito?',
    'Aiutaci a capire le preferenze della community di sviluppatori',
    'single_choice',
    true
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (1, 'Python', 0),
    (1, 'JavaScript', 1),
    (1, 'TypeScript', 2),
    (1, 'Java', 3),
    (1, 'Go', 4),
    (1, 'Rust', 5);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (1, 1);  -- Tag "Tecnologia"

-- Sondaggio di esempio 2: Rating
INSERT INTO surveys (
    title,
    description,
    question_type,
    min_value,
    max_value,
    rating_icon,
    allow_custom_options
) VALUES (
    'Valuta i nostri servizi',
    'Aiutaci a migliorare valutando diversi aspetti del nostro servizio',
    'rating',
    1,
    5,
    'star',
    true
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (2, 'Qualità del servizio', 0),
    (2, 'Velocità di risposta', 1),
    (2, 'Professionalità', 2),
    (2, 'Rapporto qualità/prezzo', 3);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (2, 2);  -- Tag "Lavoro"

-- Sondaggio di esempio 3: Scala Numerica
INSERT INTO surveys (
    title,
    description,
    question_type,
    min_value,
    max_value,
    scale_min_label,
    scale_max_label,
    allow_custom_options
) VALUES (
    'Quanto sei soddisfatto del tuo lavoro attuale?',
    'Valuta il tuo livello di soddisfazione su una scala da 1 a 10',
    'scale',
    1,
    10,
    'Per niente soddisfatto',
    'Completamente soddisfatto',
    false
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (3, 'Ambiente di lavoro', 0),
    (3, 'Stipendio e benefit', 1),
    (3, 'Opportunità di crescita', 2);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (3, 2);  -- Tag "Lavoro"

-- Sondaggio di esempio 4: Scelta Multipla
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options
) VALUES (
    'Quali sport pratichi regolarmente?',
    'Puoi selezionare più opzioni',
    'multiple_choice',
    true
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (4, 'Calcio', 0),
    (4, 'Tennis', 1),
    (4, 'Nuoto', 2),
    (4, 'Palestra', 3),
    (4, 'Corsa', 4),
    (4, 'Ciclismo', 5);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (4, 3);  -- Tag "Sport"

-- Sondaggio di esempio 5: Data
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options
) VALUES (
    'Quando sei disponibile per il team meeting?',
    'Seleziona la data che preferisci o proponi una nuova data',
    'date',
    true
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (5, '2024-11-15', 0),
    (5, '2024-11-16', 1),
    (5, '2024-11-17', 2);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (5, 2);  -- Tag "Lavoro"

-- Sondaggio di esempio 6: Risposta Aperta
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options
) VALUES (
    'Suggerimenti per migliorare Web Democracy',
    'Condividi le tue idee e suggerimenti',
    'open_text',
    true
);

INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    (6, 'Funzionalità mancanti', 0),
    (6, 'Miglioramenti UI/UX', 1),
    (6, 'Performance e velocità', 2);

INSERT INTO survey_tags (survey_id, tag_id) VALUES (6, 1);  -- Tag "Tecnologia"

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
    RAISE NOTICE 'Tables created: 8';
    RAISE NOTICE 'Sample surveys: 6';
    RAISE NOTICE 'Tags: 8';
    RAISE NOTICE 'Version: 2.1';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
