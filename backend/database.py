"""
Database configuration for Web Democracy
Unified version supporting both Local and Hybrid deployments

- Local mode: PostgreSQL in Docker (schema: public)
- Hybrid mode: Databricks Lakebase (schema: webdemocracy)

For Full Databricks mode, use lakebase_connector.py instead.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# Carica variabili d'ambiente dal file .env.lakebase se esiste
env_path = Path(__file__).parent.parent / '.env.lakebase'
if env_path.exists():
    load_dotenv(env_path)

# Configurazione: determina se usare Lakebase o PostgreSQL locale
USE_LAKEBASE = os.getenv("USE_LAKEBASE", "false").lower() == "true"

if USE_LAKEBASE:
    # ========================================================================
    # MODALITÀ HYBRID: Databricks Lakebase
    # ========================================================================
    # Lakebase è PostgreSQL-compatibile (porta 5432)
    lakebase_host = os.getenv("LAKEBASE_HOST")
    lakebase_port = os.getenv("LAKEBASE_PORT", "5432")
    lakebase_database = os.getenv("LAKEBASE_DATABASE", "default")
    lakebase_schema = os.getenv("LAKEBASE_SCHEMA", "webdemocracy")  # Schema dedicato
    lakebase_user = os.getenv("LAKEBASE_USER")
    lakebase_password = os.getenv("LAKEBASE_PASSWORD")
    
    # Opzionale: usa sslmode per connessioni sicure
    lakebase_sslmode = os.getenv("LAKEBASE_SSLMODE", "require")
    
    # Validazione credenziali
    if not all([lakebase_host, lakebase_user, lakebase_password]):
        raise ValueError(
            "Mancano credenziali Databricks Lakebase. Controlla il file .env.lakebase:\n"
            "- LAKEBASE_HOST (hostname Lakebase)\n"
            "- LAKEBASE_USER (username)\n"
            "- LAKEBASE_PASSWORD (password)\n"
            "- LAKEBASE_DATABASE (default: 'default')\n"
            "- LAKEBASE_SCHEMA (default: 'webdemocracy')\n"
        )
    
    # Costruisci DATABASE_URL per PostgreSQL (Lakebase è compatibile)
    # Formato: postgresql://user:password@host:5432/database?sslmode=require
    DATABASE_URL = (
        f"postgresql://{lakebase_user}:{lakebase_password}@"
        f"{lakebase_host}:{lakebase_port}/{lakebase_database}"
        f"?sslmode={lakebase_sslmode}"
    )
    
    print("=" * 60)
    print("🔗 Connessione a Databricks Lakebase (PostgreSQL)")
    print("=" * 60)
    print(f"   Host: {lakebase_host}:{lakebase_port}")
    print(f"   Database: {lakebase_database}")
    print(f"   Schema: {lakebase_schema}")
    print(f"   User: {lakebase_user}")
    print(f"   SSL Mode: {lakebase_sslmode}")
    print("=" * 60)
    
    # Engine per Lakebase (standard PostgreSQL con configurazioni ottimizzate)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verifica connessione prima dell'uso
        echo=False,  # Set True per debug SQL
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 10,
            "options": f"-c search_path={lakebase_schema} -c timezone=utc"
        }
    )
    
else:
    # ========================================================================
    # MODALITÀ LOCAL: PostgreSQL in Docker
    # ========================================================================
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://survey_user:survey_password@localhost:5432/survey_db"
    )
    
    # Usa lo schema webdemocracy anche in locale per consistenza
    local_schema = "webdemocracy"
    
    print("=" * 60)
    print("🔗 Connessione a PostgreSQL locale")
    print("=" * 60)
    print(f"   URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost:5432'}")
    print(f"   Schema: {local_schema}")
    print("=" * 60)
    
    # Engine per PostgreSQL locale con schema webdemocracy
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "options": f"-c search_path={local_schema},public"
        }
    )

# ========================================================================
# Configurazione SQLAlchemy comune a entrambe le modalità
# ========================================================================
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency per ottenere sessioni database (usato da FastAPI)
def get_db():
    """
    FastAPI dependency per ottenere una sessione database.
    Garantisce che la sessione venga sempre chiusa dopo l'uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========================================================================
# Funzione di test connessione (utile per debugging)
# ========================================================================
def test_connection():
    """
    Testa la connessione al database e stampa informazioni diagnostiche.
    Utile per verificare la configurazione.
    
    Returns:
        bool: True se la connessione è OK, False altrimenti
    """
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Test connessione base
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("\n" + "=" * 60)
                print("✅ Connessione database OK")
                print("=" * 60)
                
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
                
                # Verifica numero di tabelle
                if USE_LAKEBASE:
                    tables_result = conn.execute(text(
                        f"SELECT COUNT(*) FROM information_schema.tables "
                        f"WHERE table_schema = '{os.getenv('LAKEBASE_SCHEMA', 'webdemocracy')}'"
                    ))
                else:
                    tables_result = conn.execute(text(
                        "SELECT COUNT(*) FROM information_schema.tables "
                        "WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
                    ))
                table_count = tables_result.fetchone()[0]
                print(f"   Tables: {table_count}")
                
                print("=" * 60 + "\n")
                return True
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Errore connessione database: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return False
    return False

# ========================================================================
# Auto-test quando eseguito direttamente
# ========================================================================
if __name__ == "__main__":
    print("\n🧪 Test Connessione Database\n")
    if test_connection():
        print("✅ Test completato con successo!")
    else:
        print("❌ Test fallito - controlla la configurazione")
