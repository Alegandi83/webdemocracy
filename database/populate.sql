-- ============================================================================
-- Web Democracy - Population Script with Example Surveys
-- Versione: 1.0
-- Data: 9 Novembre 2025
-- ============================================================================
-- IMPORTANTE: Questo script lavora sullo schema 'webdemocracy'
-- Crea un sondaggio di esempio per ogni tipologia disponibile
-- ============================================================================

-- Set search_path to use webdemocracy schema
SET search_path TO webdemocracy, public;

-- ============================================================================
-- UTENTI DI TEST
-- ============================================================================
-- Inserisce utenti di test se non esistono già
-- ON CONFLICT assicura che non ci siano duplicati

INSERT INTO "user" (name, email, user_role, preferred_language, gender, address_region) VALUES 
    ('Demo User', 'demo@local.dev', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
    ('Alessandro Gandini', 'alessandro.gandini@databricks.com', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
    ('Pollster User', 'pollster@webdemocracy.com', 'pollster', 'it', 'Preferisco non specificare', 'Italia')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SONDAGGI DI ESEMPIO
-- ============================================================================

-- Sondaggio 1: SINGLE CHOICE
-- Domanda a risposta singola con possibilità di aggiungere opzioni personalizzate
INSERT INTO surveys (
    title, 
    description, 
    question_type,
    allow_custom_options,
    allow_multiple_responses
) VALUES (
    'Qual è il tuo linguaggio di programmazione preferito?',
    'Aiutaci a capire le preferenze della community di sviluppatori',
    'single_choice',
    true,
    false
) RETURNING id;

-- Opzioni per Single Choice
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'Python', 0),
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'JavaScript', 1),
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'TypeScript', 2),
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'Java', 3),
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'Go', 4),
    ((SELECT id FROM surveys WHERE title = 'Qual è il tuo linguaggio di programmazione preferito?'), 'Rust', 5);

-- Tag per Single Choice
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Qual è il tuo linguaggio di programmazione preferito?' 
AND t.name = 'Tecnologia';

-- ============================================================================

-- Sondaggio 2: MULTIPLE CHOICE
-- Domanda a risposte multiple con possibilità di selezionare più opzioni
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options,
    allow_multiple_responses
) VALUES (
    'Quali sport pratichi regolarmente?',
    'Puoi selezionare tutte le opzioni che si applicano al tuo caso',
    'multiple_choice',
    true,
    false
);

-- Opzioni per Multiple Choice
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Calcio', 0),
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Tennis', 1),
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Nuoto', 2),
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Palestra', 3),
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Corsa', 4),
    ((SELECT id FROM surveys WHERE title = 'Quali sport pratichi regolarmente?'), 'Ciclismo', 5);

-- Tag per Multiple Choice
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Quali sport pratichi regolarmente?' 
AND t.name = 'Sport';

-- ============================================================================

-- Sondaggio 3: OPEN TEXT
-- Domanda a risposta aperta con possibilità di fornire testo libero per ogni aspetto
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options,
    require_comment
) VALUES (
    'Suggerimenti per migliorare Web Democracy',
    'Condividi le tue idee e suggerimenti per rendere la piattaforma ancora migliore',
    'open_text',
    true,
    false
);

-- Opzioni per Open Text (aspetti da commentare)
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Suggerimenti per migliorare Web Democracy'), 'Funzionalità mancanti', 0),
    ((SELECT id FROM surveys WHERE title = 'Suggerimenti per migliorare Web Democracy'), 'Miglioramenti UI/UX', 1),
    ((SELECT id FROM surveys WHERE title = 'Suggerimenti per migliorare Web Democracy'), 'Performance e velocità', 2),
    ((SELECT id FROM surveys WHERE title = 'Suggerimenti per migliorare Web Democracy'), 'Documentazione', 3);

-- Tag per Open Text
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Suggerimenti per migliorare Web Democracy' 
AND t.name = 'Tecnologia';

-- ============================================================================

-- Sondaggio 4: SCALE
-- Scala numerica da 1 a 10 con etichette min/max
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
    'Valuta la tua soddisfazione lavorativa',
    'Esprimi il tuo livello di soddisfazione su vari aspetti del tuo lavoro (scala 1-10)',
    'scale',
    1,
    10,
    'Per niente soddisfatto',
    'Completamente soddisfatto',
    false
);

-- Opzioni per Scale (aspetti da valutare)
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Valuta la tua soddisfazione lavorativa'), 'Ambiente di lavoro', 0),
    ((SELECT id FROM surveys WHERE title = 'Valuta la tua soddisfazione lavorativa'), 'Stipendio e benefit', 1),
    ((SELECT id FROM surveys WHERE title = 'Valuta la tua soddisfazione lavorativa'), 'Opportunità di crescita', 2),
    ((SELECT id FROM surveys WHERE title = 'Valuta la tua soddisfazione lavorativa'), 'Work-life balance', 3);

-- Tag per Scale
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Valuta la tua soddisfazione lavorativa' 
AND t.name = 'Lavoro';

-- ============================================================================

-- Sondaggio 5: RATING
-- Rating con stelle da 1 a 5 per valutare diversi servizi
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
    'Aiutaci a migliorare valutando diversi aspetti del nostro servizio con le stelle',
    'rating',
    1,
    5,
    'star',
    true
);

-- Opzioni per Rating
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Valuta i nostri servizi'), 'Qualità del servizio', 0),
    ((SELECT id FROM surveys WHERE title = 'Valuta i nostri servizi'), 'Velocità di risposta', 1),
    ((SELECT id FROM surveys WHERE title = 'Valuta i nostri servizi'), 'Professionalità del personale', 2),
    ((SELECT id FROM surveys WHERE title = 'Valuta i nostri servizi'), 'Rapporto qualità/prezzo', 3),
    ((SELECT id FROM surveys WHERE title = 'Valuta i nostri servizi'), 'Facilità di utilizzo', 4);

-- Tag per Rating
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Valuta i nostri servizi' 
AND t.name = 'Lavoro';

-- ============================================================================

-- Sondaggio 6: DATE
-- Selezione di date con possibilità di proporre nuove date
INSERT INTO surveys (
    title,
    description,
    question_type,
    allow_custom_options
) VALUES (
    'Quando sei disponibile per il team meeting?',
    'Seleziona la data che preferisci o proponi una nuova data se nessuna ti va bene',
    'date',
    true
);

-- Opzioni per Date (date proposte)
INSERT INTO survey_options (survey_id, option_text, option_order) VALUES 
    ((SELECT id FROM surveys WHERE title = 'Quando sei disponibile per il team meeting?'), '2025-11-15', 0),
    ((SELECT id FROM surveys WHERE title = 'Quando sei disponibile per il team meeting?'), '2025-11-16', 1),
    ((SELECT id FROM surveys WHERE title = 'Quando sei disponibile per il team meeting?'), '2025-11-17', 2),
    ((SELECT id FROM surveys WHERE title = 'Quando sei disponibile per il team meeting?'), '2025-11-20', 3);

-- Tag per Date
INSERT INTO survey_tags (survey_id, tag_id) 
SELECT s.id, t.id 
FROM surveys s, tags t 
WHERE s.title = 'Quando sei disponibile per il team meeting?' 
AND t.name = 'Lavoro';

-- ============================================================================
-- STATISTICHE
-- ============================================================================

-- Aggiorna le statistiche per performance ottimali
ANALYZE surveys;
ANALYZE survey_options;
ANALYZE survey_tags;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
    survey_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO survey_count FROM surveys;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Populated Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Example surveys created: 6';
    RAISE NOTICE '  - Single Choice: 1';
    RAISE NOTICE '  - Multiple Choice: 1';
    RAISE NOTICE '  - Open Text: 1';
    RAISE NOTICE '  - Scale (1-10): 1';
    RAISE NOTICE '  - Rating (Stars): 1';
    RAISE NOTICE '  - Date: 1';
    RAISE NOTICE 'Total surveys in database: %', survey_count;
    RAISE NOTICE 'Schema: webdemocracy';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

