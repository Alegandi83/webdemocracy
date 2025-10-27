"""
Database configuration for Databricks Lakebase
Alternative to database.py for Lakebase deployment

Databricks Lakebase è un servizio PostgreSQL-compatibile gestito.
Usa la porta standard PostgreSQL 5432, non SQL Warehouse (443).
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# Carica variabili d'ambiente dal file nella directory principale del progetto
env_path = Path(__file__).parent.parent / '.env.lakebase'
load_dotenv(env_path)

# Configurazione Databricks Lakebase
USE_LAKEBASE = os.getenv("USE_LAKEBASE", "false").lower() == "true"

if USE_LAKEBASE:
    # Lakebase è PostgreSQL-compatibile (porta 5432)
    lakebase_host = os.getenv("LAKEBASE_HOST")
    lakebase_port = os.getenv("LAKEBASE_PORT", "5432")
    lakebase_database = os.getenv("LAKEBASE_DATABASE", "default")
    lakebase_schema = os.getenv("LAKEBASE_SCHEMA", "public")
    lakebase_user = os.getenv("LAKEBASE_USER")
    lakebase_password = os.getenv("LAKEBASE_PASSWORD")
    
    # Opzionale: usa sslmode per connessioni sicure
    lakebase_sslmode = os.getenv("LAKEBASE_SSLMODE", "require")
    
    if not all([lakebase_host, lakebase_user, lakebase_password]):
        raise ValueError(
            "Mancano credenziali Databricks Lakebase. Controlla il file .env.lakebase:\n"
            "- LAKEBASE_HOST (hostname Lakebase)\n"
            "- LAKEBASE_USER (username)\n"
            "- LAKEBASE_PASSWORD (password)\n"
            "- LAKEBASE_DATABASE (default: 'default')\n"
            "- LAKEBASE_SCHEMA (default: 'public')\n"
        )
    
    # Costruisci DATABASE_URL per PostgreSQL (Lakebase è compatibile)
    # Formato: postgresql://user:password@host:5432/database?sslmode=require
    DATABASE_URL = (
        f"postgresql://{lakebase_user}:{lakebase_password}@"
        f"{lakebase_host}:{lakebase_port}/{lakebase_database}"
        f"?sslmode={lakebase_sslmode}"
    )
    
    print(f"🔗 Connessione a Databricks Lakebase (PostgreSQL)")
    print(f"   Host: {lakebase_host}:{lakebase_port}")
    print(f"   Database: {lakebase_database}")
    print(f"   Schema: {lakebase_schema}")
    print(f"   User: {lakebase_user}")
    print(f"   SSL Mode: {lakebase_sslmode}")
    
    # Engine per Lakebase (standard PostgreSQL)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verifica connessione prima dell'uso
        echo=False,  # Set True per debug
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 10,
            "options": f"-c search_path={lakebase_schema} -c timezone=utc"
        }
    )
    
else:
    # Fallback a PostgreSQL locale (modalità standard)
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://survey_user:survey_password@localhost:5432/survey_db"
    )
    print(f"🔗 Connessione a PostgreSQL locale")
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency per ottenere sessioni database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connessione
def test_connection():
    """Testa la connessione al database"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Connessione database OK")
                
                # Verifica versione PostgreSQL/Lakebase
                version_result = conn.execute(text("SELECT version()"))
                version = version_result.fetchone()[0]
                print(f"   Database version: {version[:60]}...")
                
                # Verifica schema corrente
                schema_result = conn.execute(text("SELECT current_schema()"))
                current_schema = schema_result.fetchone()[0]
                print(f"   Current schema: {current_schema}")
                
                # Verifica search_path
                search_path_result = conn.execute(text("SHOW search_path"))
                search_path = search_path_result.fetchone()[0]
                print(f"   Search path: {search_path}")
                
                return True
    except Exception as e:
        print(f"❌ Errore connessione database: {e}")
        import traceback
        traceback.print_exc()
        return False
    return False

if __name__ == "__main__":
    # Test connessione quando eseguito direttamente
    test_connection()

