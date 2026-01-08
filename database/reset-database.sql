-- ============================================================================
-- Reset Web Democracy Database Schema
-- Esegui questo script nel SQL Editor di Databricks prima del rideploy
-- ============================================================================

-- Drop dello schema webdemocracy e tutti i suoi oggetti
DROP SCHEMA IF EXISTS webdemocracy CASCADE;

-- Lo schema verrà ricreato automaticamente dall'app al prossimo avvio
SELECT 'Database schema dropped successfully. Restart the app to recreate it.' as message;

