"""
Lakebase Connector for Web Democracy Application
Provides database connection using Databricks OAuth authentication
"""
import os
from databricks.sdk import WorkspaceClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Initialize Databricks workspace client
workspace_client = WorkspaceClient()
user = workspace_client.current_user.me().user_name

# Get PostgreSQL connection parameters from environment
postgres_username = user
postgres_host = os.getenv("PGHOST")
postgres_port = os.getenv("PGPORT")
postgres_database = os.getenv("PGDATABASE")

print("=" * 60)
print("🔗 Databricks Lakebase Connection")
print("=" * 60)
print(f"postgres_username: {postgres_username}")
print(f"postgres_host: {postgres_host}")
print(f"postgres_port: {postgres_port}")
print(f"postgres_database: {postgres_database}")
print("=" * 60)

# Create SQLAlchemy engine
postgres_pool = create_engine(
    f"postgresql+psycopg2://{postgres_username}:@{postgres_host}:{postgres_port}/{postgres_database}"
)

# Base for models
Base = declarative_base()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=postgres_pool)


@event.listens_for(postgres_pool, "do_connect")
def provide_token(dialect, conn_rec, cargs, cparams):
    """Provide the App's OAuth token. Caching is managed by WorkspaceClient"""
    cparams["password"] = workspace_client.config.oauth_token().access_token


def get_db():
    """Dependency for getting database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_schema():
    """
    Initialize the database schema for Web Democracy.
    Creates all tables, enums, and initial data.
    """
    print("\n" + "=" * 60)
    print("🚀 Initializing Web Democracy Schema")
    print("=" * 60)
    
    with postgres_pool.begin() as conn:
        # Create schema if not exists
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS webdemocracy"))
        print("✅ Schema 'webdemocracy' created (or already exists)")
        
        # Grant privileges
        conn.execute(text("GRANT USAGE ON SCHEMA webdemocracy TO PUBLIC"))
        conn.execute(
            text("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA webdemocracy TO PUBLIC")
        )
        print("✅ Read/Write permissions granted to all users")
        
        # Create enum type for question_type
        conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE webdemocracy.questiontype AS ENUM (
                    'single_choice',
                    'multiple_choice',
                    'open_text',
                    'scale',
                    'rating',
                    'date'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        print("✅ Enum type 'questiontype' created (or already exists)")
        
        # Create tags table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                color VARCHAR(20) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'tags' created (or already exists)")
        
        # Create surveys table (schema from init-lakebase.sql)
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.surveys (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                question_type webdemocracy.questiontype DEFAULT 'single_choice' NOT NULL,
                
                -- Per domande di tipo scala/rating
                min_value INTEGER DEFAULT 1,
                max_value INTEGER DEFAULT 5,
                scale_min_label VARCHAR(100),
                scale_max_label VARCHAR(100),
                
                -- Scadenza e validità
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE,
                
                -- Opzioni
                allow_multiple_responses BOOLEAN DEFAULT FALSE,
                allow_custom_options BOOLEAN DEFAULT FALSE,
                require_comment BOOLEAN DEFAULT FALSE,
                rating_icon VARCHAR(20) DEFAULT 'star'
            )
        """))
        print("✅ Table 'surveys' created (or already exists)")
        
        # Create survey_options table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.survey_options (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_text VARCHAR(500) NOT NULL,
                option_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'survey_options' created (or already exists)")
        
        # Create survey_tags junction table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.survey_tags (
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES webdemocracy.tags(id) ON DELETE CASCADE,
                PRIMARY KEY (survey_id, tag_id)
            )
        """))
        print("✅ Table 'survey_tags' created (or already exists)")
        
        # Create votes table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.votes (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_id INTEGER REFERENCES webdemocracy.survey_options(id) ON DELETE CASCADE,
                voter_ip VARCHAR(45),
                voter_session VARCHAR(100),
                
                -- Per risposte numeriche, scale, rating
                numeric_value DOUBLE PRECISION,
                date_value TIMESTAMP WITH TIME ZONE,
                
                voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'votes' created (or already exists)")
        
        # Create open_responses table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.open_responses (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_id INTEGER REFERENCES webdemocracy.survey_options(id) ON DELETE CASCADE,
                voter_ip VARCHAR(45),
                voter_session VARCHAR(100),
                response_text TEXT NOT NULL,
                responded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'open_responses' created (or already exists)")
        
        # Create survey_likes table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.survey_likes (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                user_ip VARCHAR(45),
                user_session VARCHAR(100),
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'survey_likes' created (or already exists)")
        
        # Create settings table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy.settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'settings' created (or already exists)")
        
        # Create user table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS webdemocracy."user" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                date_of_birth DATE,
                profile_photo TEXT,
                user_role VARCHAR(50) DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'pollster')),
                gender VARCHAR(50),
                address_region VARCHAR(255),
                preferred_language VARCHAR(10) DEFAULT 'it',
                registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                actual_geolocation VARCHAR(255),
                last_login_date TIMESTAMP WITH TIME ZONE,
                last_ip_address VARCHAR(45),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'user' created (or already exists)")
        
        # Create indexes for performance (from init-lakebase.sql)
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tags_name ON webdemocracy.tags(name)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_question_type ON webdemocracy.surveys(question_type)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON webdemocracy.surveys(is_active)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON webdemocracy.surveys(created_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON webdemocracy.survey_options(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_options_order ON webdemocracy.survey_options(survey_id, option_order)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_tags_survey ON webdemocracy.survey_tags(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_tags_tag ON webdemocracy.survey_tags(tag_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_survey_id ON webdemocracy.votes(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_option_id ON webdemocracy.votes(option_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_session ON webdemocracy.votes(voter_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_ip ON webdemocracy.votes(voter_ip)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON webdemocracy.votes(voted_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_survey_id ON webdemocracy.open_responses(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_option_id ON webdemocracy.open_responses(option_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_session ON webdemocracy.open_responses(voter_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_responded_at ON webdemocracy.open_responses(responded_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_survey_id ON webdemocracy.survey_likes(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_session ON webdemocracy.survey_likes(user_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_created_at ON webdemocracy.survey_likes(created_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_settings_key ON webdemocracy.settings(key)"))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_user_email ON webdemocracy."user"(email)'))
        print("✅ Indexes created (22 indexes)")
        
        # Check if tags table is empty and insert default tags
        result = conn.execute(text("SELECT COUNT(*) FROM webdemocracy.tags"))
        count = result.scalar()
        if count == 0:
            conn.execute(text("""
                INSERT INTO webdemocracy.tags (name, color) VALUES
                    ('Tecnologia', '#3b82f6'),
                    ('Lavoro', '#ef4444'),
                    ('Sport', '#22c55e'),
                    ('Cultura', '#a855f7'),
                    ('Cibo', '#f97316'),
                    ('Viaggi', '#06b6d4'),
                    ('Salute', '#ec4899'),
                    ('Educazione', '#eab308')
            """))
            print("✅ Default tags inserted")
        else:
            print(f"ℹ️  Tags table already has {count} records, skipping default tags insertion")
        
        # Check if settings table has qr_code_url
        result = conn.execute(text("""
            SELECT COUNT(*) FROM webdemocracy.settings WHERE key = 'qr_code_url'
        """))
        count = result.scalar()
        if count == 0:
            conn.execute(text("""
                INSERT INTO webdemocracy.settings (key, value)
                VALUES ('qr_code_url', 'https://databricks.com')
            """))
            print("✅ Default QR code setting inserted")
        else:
            print("ℹ️  QR code setting already exists")
        
        # Check if user table is empty and insert default users
        result = conn.execute(text('SELECT COUNT(*) FROM webdemocracy."user"'))
        count = result.scalar()
        if count == 0:
            conn.execute(text("""
                INSERT INTO webdemocracy."user" (name, email, user_role, preferred_language, gender, address_region) VALUES 
                    ('Demo User', 'demo@local.dev', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
                    ('Alessandro Gandini', 'alessandro.gandini@databricks.com', 'admin', 'it', 'Preferisco non specificare', 'Italia'),
                    ('Pollster User', 'pollster@webdemocracy.com', 'pollster', 'it', 'Preferisco non specificare', 'Italia')
            """))
            print("✅ Default users inserted (3 users)")
        else:
            print(f"ℹ️  User table already has {count} records, skipping default users insertion")
        
        # Check if surveys table is empty and insert demo surveys
        result = conn.execute(text("SELECT COUNT(*) FROM webdemocracy.surveys"))
        count = result.scalar()
        if count == 0:
            print("📊 Inserting demo surveys...")
            
            # Survey 1: Single Choice
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options)
                VALUES ('Qual è il tuo linguaggio di programmazione preferito?', 
                        'Aiutaci a capire le preferenze della community di sviluppatori', 
                        'single_choice', true)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (1, 'Python', 0), (1, 'JavaScript', 1), (1, 'TypeScript', 2), 
                    (1, 'Java', 3), (1, 'Go', 4), (1, 'Rust', 5)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (1, 1)"))
            
            # Survey 2: Rating
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, min_value, max_value, rating_icon, allow_custom_options)
                VALUES ('Valuta i nostri servizi', 
                        'Aiutaci a migliorare valutando diversi aspetti del nostro servizio',
                        'rating', 1, 5, 'star', true)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (2, 'Qualità del servizio', 0), (2, 'Velocità di risposta', 1), 
                    (2, 'Professionalità', 2), (2, 'Rapporto qualità/prezzo', 3)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (2, 2)"))
            
            # Survey 3: Scale
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, min_value, max_value, 
                                                   scale_min_label, scale_max_label, allow_custom_options)
                VALUES ('Quanto sei soddisfatto del tuo lavoro attuale?',
                        'Valuta il tuo livello di soddisfazione su una scala da 1 a 10',
                        'scale', 1, 10, 'Per niente soddisfatto', 'Completamente soddisfatto', false)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (3, 'Ambiente di lavoro', 0), (3, 'Stipendio e benefit', 1), (3, 'Opportunità di crescita', 2)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (3, 2)"))
            
            # Survey 4: Multiple Choice
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options)
                VALUES ('Quali sport pratichi regolarmente?', 
                        'Puoi selezionare più opzioni', 
                        'multiple_choice', true)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (4, 'Calcio', 0), (4, 'Tennis', 1), (4, 'Nuoto', 2), 
                    (4, 'Palestra', 3), (4, 'Corsa', 4), (4, 'Ciclismo', 5)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (4, 3)"))
            
            # Survey 5: Date
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options)
                VALUES ('Quando sei disponibile per il team meeting?',
                        'Seleziona la data che preferisci o proponi una nuova data',
                        'date', true)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (5, '2024-11-15', 0), (5, '2024-11-16', 1), (5, '2024-11-17', 2)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (5, 2)"))
            
            # Survey 6: Open Text
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options)
                VALUES ('Suggerimenti per migliorare Web Democracy',
                        'Condividi le tue idee e suggerimenti',
                        'open_text', true)
            """))
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order) VALUES 
                    (6, 'Funzionalità mancanti', 0), (6, 'Miglioramenti UI/UX', 1), (6, 'Performance e velocità', 2)
            """))
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id) VALUES (6, 1)"))
            
            print("✅ 6 demo surveys inserted successfully")
        else:
            print(f"ℹ️  Surveys table already has {count} records, skipping demo surveys insertion")
    
    print("=" * 60)
    print("✨ Schema initialization complete!")
    print("=" * 60)


# Initialize schema on module import
try:
    initialize_schema()
except Exception as e:
    print(f"❌ Error initializing schema: {e}")
    import traceback
    traceback.print_exc()

