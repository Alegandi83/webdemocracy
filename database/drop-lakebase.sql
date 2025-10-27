-- ============================================================================
-- Web Democracy - Databricks Lakebase DROP Script
-- Versione: 1.0
-- Data: 27 Ottobre 2025
-- ============================================================================
-- ATTENZIONE: Questo script eliminerà TUTTI i dati dal database Lakebase!
-- Usare con cautela - tutte le tabelle, dati e tipi enum saranno eliminati.
-- ============================================================================

-- ============================================================================
-- ISTRUZIONI DI UTILIZZO
-- ============================================================================
--
-- Opzione 1: Da riga di comando (psql)
-- -------------------------------------
-- source .env.lakebase
-- export PGPASSWORD="$LAKEBASE_PASSWORD"
-- psql -h "$LAKEBASE_HOST" \
--      -p "$LAKEBASE_PORT" \
--      -U "$LAKEBASE_USER" \
--      -d "$LAKEBASE_DATABASE" \
--      -c "SET search_path TO $LAKEBASE_SCHEMA;" \
--      -f database/drop-lakebase.sql \
--      --set=sslmode="$LAKEBASE_SSLMODE"
--
-- Opzione 2: Da Databricks SQL Editor
-- -------------------------------------
-- 1. Apri Databricks SQL Editor
-- 2. Seleziona il tuo Lakebase instance
-- 3. Copia e incolla questo script
-- 4. Esegui
--
-- Opzione 3: Script bash automatico
-- -------------------------------------
-- Vedi script: cleanup-lakebase.sh
--
-- ============================================================================

-- ⚠️  IMPORTANTE: Imposta lo schema corretto
-- Modifica 'webdem' se il tuo schema ha un nome diverso
SET search_path TO webdem;

-- Messaggio di avviso con verifica schema
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'INIZIO DROP DATABASE';
    RAISE NOTICE 'Tutti i dati saranno eliminati!';
    RAISE NOTICE 'Schema corrente: %', current_schema();
    RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- DROP TABLES (in ordine inverso per foreign key)
-- ============================================================================

-- Drop tabelle dipendenti prima
DROP TABLE IF EXISTS survey_likes CASCADE;
DROP TABLE IF EXISTS open_responses CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS survey_tags CASCADE;
DROP TABLE IF EXISTS survey_options CASCADE;

-- Drop tabelle principali
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ============================================================================
-- DROP ENUM TYPES
-- ============================================================================

DROP TYPE IF EXISTS questiontype CASCADE;

-- ============================================================================
-- VERIFICA FINALE
-- ============================================================================

-- Verifica che tutte le tabelle siano state eliminate
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = current_schema()
      AND table_type = 'BASE TABLE'
      AND table_name IN (
          'surveys', 'survey_options', 'survey_tags', 'tags', 
          'votes', 'open_responses', 'settings', 'survey_likes'
      );
    
    IF table_count = 0 THEN
        RAISE NOTICE '✅ DROP COMPLETATO - Tutte le tabelle sono state eliminate';
    ELSE
        RAISE WARNING '⚠️  Alcune tabelle potrebbero non essere state eliminate: % tabelle rimanenti', table_count;
    END IF;
END $$;

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================

