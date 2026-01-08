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

# Debug: Print environment variables
print("=" * 80)
print("🔍 DEBUG: Environment Variables")
print("=" * 80)
for key, value in sorted(os.environ.items()):
    if any(x in key.upper() for x in ['PG', 'DB', 'DATABASE', 'WEBDEMOCRACY']):
        print(f"{key} = {value}")
# Print Databricks-specific variables
print(f"DATABRICKS_HOST = {os.getenv('DATABRICKS_HOST', 'NOT SET')}")
print(f"DATABRICKS_APP_URL = {os.getenv('DATABRICKS_APP_URL', 'NOT SET')}")
print("=" * 80)

# Get PostgreSQL connection parameters from environment
# Databricks Apps exposes database resource variables with format: {RESOURCE_NAME}_{FIELD}
# Resource name in app.yml: "webdemocracy-db"
postgres_username = user
postgres_host = os.getenv("WEBDEMOCRACY_DB_HOST") or os.getenv("PGHOST")
postgres_port = os.getenv("WEBDEMOCRACY_DB_PORT") or os.getenv("PGPORT") or "5432"
postgres_database = os.getenv("WEBDEMOCRACY_DB_DATABASE_NAME") or os.getenv("PGDATABASE") or "webdemocracy_db"

print("=" * 60)
print("🔗 Databricks Lakebase Connection")
print("=" * 60)
print(f"postgres_username: {postgres_username}")
print(f"postgres_host: {postgres_host}")
print(f"postgres_port: {postgres_port}")
print(f"postgres_database: {postgres_database}")
print("=" * 60)

# Check if required parameters are available
if not postgres_host:
    print("⚠️  WARNING: postgres_host is not set!")
    print("⚠️  Databricks Apps should provide these variables automatically.")
    print("⚠️  Attempting to use default connection string...")
    # Usa un default che NON funzionerà, ma mostrerà l'errore
    postgres_host = "localhost"

print(f"🔗 Creating engine with: postgresql+psycopg2://{postgres_username}:@{postgres_host}:{postgres_port}/{postgres_database}")

# Create SQLAlchemy engine
try:
    postgres_pool = create_engine(
        f"postgresql+psycopg2://{postgres_username}:@{postgres_host}:{postgres_port}/{postgres_database}",
        echo=False,
        pool_pre_ping=True
    )
    print("✅ SQLAlchemy engine created successfully")
except Exception as e:
    print(f"❌ ERROR creating SQLAlchemy engine: {e}")
    raise

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
    
    current_db = None  # Variable to store the current database name
    
    with postgres_pool.begin() as conn:
        # Verifica in quale database siamo connessi
        result = conn.execute(text("SELECT current_database()"))
        current_db = result.scalar()
        print(f"🗄️  Connected to database: {current_db}")
        
        if current_db != postgres_database:
            print(f"⚠️  WARNING: Connected to '{current_db}' but expected '{postgres_database}'")
        
        # Create schema if not exists (verrà creato nel database corrente: webdemocracy_db)
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS webdemocracy"))
        print(f"✅ Schema 'webdemocracy' created in database '{current_db}' (or already exists)")
        
        # Grant privileges
        conn.execute(text("GRANT USAGE ON SCHEMA webdemocracy TO PUBLIC"))
        conn.execute(
            text("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA webdemocracy TO PUBLIC")
        )
        print("✅ Read/Write permissions granted to all users")
        
        # Grant explicit permissions to human user for SQL Editor access
        try:
            conn.execute(text('GRANT ALL ON SCHEMA webdemocracy TO "alessandro.gandini@databricks.com"'))
            conn.execute(text('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA webdemocracy TO "alessandro.gandini@databricks.com"'))
            conn.execute(text('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA webdemocracy TO "alessandro.gandini@databricks.com"'))
            # Also grant default privileges for future tables
            conn.execute(text('ALTER DEFAULT PRIVILEGES IN SCHEMA webdemocracy GRANT ALL ON TABLES TO "alessandro.gandini@databricks.com"'))
            conn.execute(text('ALTER DEFAULT PRIVILEGES IN SCHEMA webdemocracy GRANT ALL ON SEQUENCES TO "alessandro.gandini@databricks.com"'))
            print("✅ Full permissions granted to alessandro.gandini@databricks.com (including future objects)")
        except Exception as e:
            print(f"⚠️  Could not grant explicit permissions to alessandro.gandini@databricks.com: {e}")
        
        # ========== DROP EXISTING TABLES AND TYPES (FROM SCRATCH) ==========
        # Stesso ordine di init.sql - ordine inverso per rispettare foreign keys
        print("🗑️  Dropping existing tables and types for clean setup...")
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.user_groups CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.groups CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.survey_likes CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.open_responses CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.votes CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.survey_tags CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.survey_options CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.surveys CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.news CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.tags CASCADE"))
        conn.execute(text('DROP TABLE IF EXISTS webdemocracy."user" CASCADE'))
        conn.execute(text("DROP TABLE IF EXISTS webdemocracy.settings CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS webdemocracy.closuretype CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS webdemocracy.questiontype CASCADE"))
        print("✅ Existing tables and types dropped")
        
        # ========== CREATE ENUM TYPES ==========
        # Create enum type for question_type (IDENTICO a init.sql)
        conn.execute(text("""
                CREATE TYPE webdemocracy.questiontype AS ENUM (
                    'single_choice',
                    'multiple_choice',
                    'open_text',
                    'scale',
                    'rating',
                    'date'
            )
        """))
        print("✅ Enum type 'questiontype' created")
        
        # Create enum type for closure_type (IDENTICO a init.sql)
        conn.execute(text("""
            CREATE TYPE webdemocracy.closuretype AS ENUM (
                'permanent',
                'scheduled',
                'manual'
            )
        """))
        print("✅ Enum type 'closuretype' created")
        
        # ========== CREATE TABLES (ORDINE CORRETTO DA init.sql) ==========
        
        # Create user table FIRST (tags, surveys, etc. depend on it)
        conn.execute(text("""
            CREATE TABLE webdemocracy."user" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                date_of_birth DATE,
                profile_photo TEXT,
                user_role VARCHAR(50) DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'pollster', 'editor')),
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
        print("✅ Table 'user' created")
        
        # Create tags table AFTER user (references user)
        conn.execute(text("""
            CREATE TABLE webdemocracy.tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                color VARCHAR(7) DEFAULT '#6366f1',
                is_active BOOLEAN DEFAULT TRUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER REFERENCES webdemocracy."user"(id) ON DELETE SET NULL
            )
        """))
        print("✅ Table 'tags' created")
        
        # Create news table SECOND (surveys depends on it)
        conn.execute(text("""
            CREATE TABLE webdemocracy.news (
                id SERIAL PRIMARY KEY,
                author VARCHAR(255),
                author_href TEXT,
                author_id VARCHAR(255),
                author_name VARCHAR(255),
                body TEXT,
                content TEXT,
                description TEXT,
                excerpt TEXT,
                headline VARCHAR(500),
                title VARCHAR(500),
                canonical_url TEXT,
                href TEXT,
                url TEXT,
                paywall_url TEXT,
                brands JSONB,
                images JSONB,
                videos JSONB,
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
                source_id VARCHAR(255),
                source_name VARCHAR(255),
                source_href TEXT,
                source_location VARCHAR(255),
                source_rank INTEGER,
                source_categories JSONB,
                publisher VARCHAR(255),
                country VARCHAR(100),
                language VARCHAR(50),
                media VARCHAR(255),
                sentiment VARCHAR(50),
                date TIMESTAMP WITH TIME ZONE,
                publication_date TIMESTAMP WITH TIME ZONE,
                published_at TIMESTAMP WITH TIME ZONE,
                updated_last TIMESTAMP WITH TIME ZONE,
                is_breaking BOOLEAN DEFAULT FALSE,
                is_duplicate BOOLEAN DEFAULT FALSE,
                is_paywall BOOLEAN DEFAULT FALSE,
                related_articles JSONB,
                image TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'news' created (or already exists)")
        
        # Create surveys table (schema from init-lakebase.sql)
        conn.execute(text("""
            CREATE TABLE webdemocracy.surveys (
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
                closure_type webdemocracy.closuretype DEFAULT 'permanent' NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE,
                show_results_on_close BOOLEAN DEFAULT FALSE,
                
                -- Opzioni
                allow_multiple_responses BOOLEAN DEFAULT FALSE,
                allow_custom_options BOOLEAN DEFAULT FALSE,
                require_comment BOOLEAN DEFAULT FALSE,
                rating_icon VARCHAR(20) DEFAULT 'star',
                is_anonymous BOOLEAN DEFAULT FALSE,
                
                -- Resource fields
                resource_type VARCHAR(20) DEFAULT 'none',
                resource_url TEXT,
                resource_news_id INTEGER REFERENCES webdemocracy.news(id) ON DELETE SET NULL,
                
                -- Creatore del sondaggio
                user_id INTEGER NOT NULL REFERENCES webdemocracy."user"(id) ON DELETE CASCADE
            )
        """))
        print("✅ Table 'surveys' created (or already exists)")
        
        # Create survey_options table
        conn.execute(text("""
            CREATE TABLE webdemocracy.survey_options (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_text VARCHAR(500) NOT NULL,
                option_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER REFERENCES webdemocracy."user"(id) ON DELETE CASCADE
            )
        """))
        print("✅ Table 'survey_options' created (or already exists)")
        
        # Create survey_tags junction table
        conn.execute(text("""
            CREATE TABLE webdemocracy.survey_tags (
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES webdemocracy.tags(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES webdemocracy."user"(id) ON DELETE CASCADE,
                PRIMARY KEY (survey_id, tag_id)
            )
        """))
        print("✅ Table 'survey_tags' created (or already exists)")
        
        # Create votes table
        conn.execute(text("""
            CREATE TABLE webdemocracy.votes (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_id INTEGER REFERENCES webdemocracy.survey_options(id) ON DELETE CASCADE,
                voter_ip VARCHAR(45),
                voter_session VARCHAR(100),
                
                -- Per risposte numeriche, scale, rating
                numeric_value DOUBLE PRECISION,
                date_value TIMESTAMP WITH TIME ZONE,
                
                voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                -- Utente che ha votato (nullable per supportare voti anonimi)
                user_id INTEGER REFERENCES webdemocracy."user"(id) ON DELETE CASCADE
            )
        """))
        print("✅ Table 'votes' created (or already exists)")
        
        # Create open_responses table
        conn.execute(text("""
            CREATE TABLE webdemocracy.open_responses (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                option_id INTEGER REFERENCES webdemocracy.survey_options(id) ON DELETE CASCADE,
                voter_ip VARCHAR(45),
                voter_session VARCHAR(100),
                response_text TEXT NOT NULL,
                responded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                -- Utente che ha risposto (nullable per supportare risposte anonime)
                user_id INTEGER REFERENCES webdemocracy."user"(id) ON DELETE CASCADE
            )
        """))
        print("✅ Table 'open_responses' created (or already exists)")
        
        # Create survey_likes table
        conn.execute(text("""
            CREATE TABLE webdemocracy.survey_likes (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER NOT NULL REFERENCES webdemocracy.surveys(id) ON DELETE CASCADE,
                user_ip VARCHAR(45),
                user_session VARCHAR(100),
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                -- Utente che ha messo il like (nullable per supportare like anonimi)
                user_id INTEGER REFERENCES webdemocracy."user"(id) ON DELETE CASCADE
            )
        """))
        print("✅ Table 'survey_likes' created (or already exists)")
        
        # Create settings table
        conn.execute(text("""
            CREATE TABLE webdemocracy.settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Table 'settings' created (or already exists)")
        
        # Create groups table
        conn.execute(text("""
            CREATE TABLE webdemocracy.groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER REFERENCES webdemocracy."user"(id) ON DELETE SET NULL
            )
        """))
        print("✅ Table 'groups' created (or already exists)")
        
        # Create user_groups junction table
        conn.execute(text("""
            CREATE TABLE webdemocracy.user_groups (
                user_id INTEGER NOT NULL REFERENCES webdemocracy."user"(id) ON DELETE CASCADE,
                group_id INTEGER NOT NULL REFERENCES webdemocracy.groups(id) ON DELETE CASCADE,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, group_id)
            )
        """))
        print("✅ Table 'user_groups' created (or already exists)")
        
        # Create indexes for performance (completamente allineato con init.sql)
        # User indexes
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_user_email ON webdemocracy."user"(email)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_user_role ON webdemocracy."user"(user_role)'))
        
        # Tags indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tags_name ON webdemocracy.tags(name)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tags_user_id ON webdemocracy.tags(user_id)"))
        
        # Surveys indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_question_type ON webdemocracy.surveys(question_type)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_closure_type ON webdemocracy.surveys(closure_type)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON webdemocracy.surveys(is_active)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON webdemocracy.surveys(created_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON webdemocracy.surveys(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_resource_type ON webdemocracy.surveys(resource_type)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_surveys_resource_news_id ON webdemocracy.surveys(resource_news_id)"))
        
        # Survey options indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON webdemocracy.survey_options(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_options_order ON webdemocracy.survey_options(survey_id, option_order)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_options_user_id ON webdemocracy.survey_options(user_id)"))
        
        # Survey tags indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_tags_survey ON webdemocracy.survey_tags(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_tags_tag ON webdemocracy.survey_tags(tag_id)"))
        
        # Votes indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_survey_id ON webdemocracy.votes(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_option_id ON webdemocracy.votes(option_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_session ON webdemocracy.votes(voter_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_ip ON webdemocracy.votes(voter_ip)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON webdemocracy.votes(voted_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_votes_user_id ON webdemocracy.votes(user_id)"))
        
        # Open responses indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_survey_id ON webdemocracy.open_responses(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_option_id ON webdemocracy.open_responses(option_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_session ON webdemocracy.open_responses(voter_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_responded_at ON webdemocracy.open_responses(responded_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_open_responses_user_id ON webdemocracy.open_responses(user_id)"))
        
        # Survey likes indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_survey_id ON webdemocracy.survey_likes(survey_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_session ON webdemocracy.survey_likes(user_session)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_created_at ON webdemocracy.survey_likes(created_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_survey_likes_user_id ON webdemocracy.survey_likes(user_id)"))
        
        # Settings indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_settings_key ON webdemocracy.settings(key)"))
        
        # Groups indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_groups_name ON webdemocracy.groups(name)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_groups_created_by ON webdemocracy.groups(created_by)"))
        
        # User groups indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_groups_user_id ON webdemocracy.user_groups(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_groups_group_id ON webdemocracy.user_groups(group_id)"))
        
        print("✅ Indexes created (47 indexes - completamente allineato con init.sql)")
        
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
        
        # Ensure current user exists and has admin role for Databricks Apps
        print("=" * 60)
        print("👤 Checking current user permissions...")
        print("=" * 60)
        try:
            current_user_email = workspace_client.current_user.me().user_name
            print(f"Current user email: {current_user_email}")
            
            result = conn.execute(text("""
                SELECT id, name, email, user_role FROM webdemocracy."user" WHERE email = :email
            """), {"email": current_user_email})
            existing_user = result.fetchone()
            
            if existing_user is None:
                # User doesn't exist, create with admin role
                print(f"User {current_user_email} not found in database, creating with admin role...")
                conn.execute(text("""
                    INSERT INTO webdemocracy."user" (name, email, user_role, preferred_language, gender, address_region)
                    VALUES (:name, :email, 'admin', 'it', 'Preferisco non specificare', 'Italia')
                """), {"name": current_user_email.split('@')[0].title(), "email": current_user_email})
                print(f"✅ Created user {current_user_email} with admin role")
            elif existing_user[3] != 'admin':
                # User exists but not admin, upgrade to admin
                print(f"User {current_user_email} found with role '{existing_user[3]}', upgrading to admin...")
                conn.execute(text("""
                    UPDATE webdemocracy."user" SET user_role = 'admin' WHERE email = :email
                """), {"email": current_user_email})
                print(f"✅ Upgraded user {current_user_email} from '{existing_user[3]}' to admin")
            else:
                print(f"✅ User {current_user_email} already has admin role (id: {existing_user[0]})")
            
            # Verify the update
            result = conn.execute(text("""
                SELECT id, name, email, user_role FROM webdemocracy."user" WHERE email = :email
            """), {"email": current_user_email})
            user_after = result.fetchone()
            if user_after:
                print(f"🔍 Verification - User: {user_after[1]}, Email: {user_after[2]}, Role: {user_after[3]}")
        except Exception as e:
            print(f"❌ Error ensuring admin role for current user: {e}")
            import traceback
            traceback.print_exc()
        print("=" * 60)
        
        # ALSO ensure alessandro.gandini@databricks.com exists and has admin role
        print("👤 Checking alessandro.gandini@databricks.com permissions...")
        try:
            alessandro_email = "alessandro.gandini@databricks.com"
            result = conn.execute(text("""
                SELECT id, name, email, user_role FROM webdemocracy."user" WHERE email = :email
            """), {"email": alessandro_email})
            existing_user = result.fetchone()
            
            if existing_user is None:
                # User doesn't exist, create with admin role
                print(f"User {alessandro_email} not found in database, creating with admin role...")
                conn.execute(text("""
                    INSERT INTO webdemocracy."user" (name, email, user_role, preferred_language, gender, address_region)
                    VALUES ('Alessandro Gandini', :email, 'admin', 'it', 'Preferisco non specificare', 'Italia')
                """), {"email": alessandro_email})
                print(f"✅ Created user {alessandro_email} with admin role")
            elif existing_user[3] != 'admin':
                # User exists but not admin, upgrade to admin
                print(f"User {alessandro_email} found with role '{existing_user[3]}', upgrading to admin...")
                conn.execute(text("""
                    UPDATE webdemocracy."user" SET user_role = 'admin' WHERE email = :email
                """), {"email": alessandro_email})
                print(f"✅ Upgraded user {alessandro_email} from '{existing_user[3]}' to admin")
            else:
                print(f"✅ User {alessandro_email} already has admin role (id: {existing_user[0]})")
        except Exception as e:
            print(f"❌ Error ensuring admin role for alessandro.gandini@databricks.com: {e}")
        print("=" * 60)
        
        # Check if surveys table is empty and insert demo surveys
        result = conn.execute(text("SELECT COUNT(*) FROM webdemocracy.surveys"))
        count = result.scalar()
        if count == 0:
            print("📊 Inserting demo surveys...")
            
            # Get the ID of the first admin user for demo surveys
            result = conn.execute(text('SELECT id FROM webdemocracy."user" WHERE user_role = \'admin\' LIMIT 1'))
            admin_user_id = result.scalar()
            if admin_user_id is None:
                print("⚠️  No admin user found, using user_id=1 for demo surveys")
                admin_user_id = 1
            else:
                print(f"✅ Using admin user_id={admin_user_id} for demo surveys")
            
            # Survey 1: Single Choice
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options, user_id)
                VALUES ('Qual è il tuo linguaggio di programmazione preferito?', 
                        'Aiutaci a capire le preferenze della community di sviluppatori', 
                        'single_choice', true, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (1, 'Python', 0, :user_id), (1, 'JavaScript', 1, :user_id), (1, 'TypeScript', 2, :user_id), 
                    (1, 'Java', 3, :user_id), (1, 'Go', 4, :user_id), (1, 'Rust', 5, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (1, 1, :user_id)"), {"user_id": admin_user_id})
            
            # Survey 2: Rating
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, min_value, max_value, rating_icon, allow_custom_options, user_id)
                VALUES ('Valuta i nostri servizi', 
                        'Aiutaci a migliorare valutando diversi aspetti del nostro servizio',
                        'rating', 1, 5, 'star', true, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (2, 'Qualità del servizio', 0, :user_id), (2, 'Velocità di risposta', 1, :user_id), 
                    (2, 'Professionalità', 2, :user_id), (2, 'Rapporto qualità/prezzo', 3, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (2, 2, :user_id)"), {"user_id": admin_user_id})
            
            # Survey 3: Scale
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, min_value, max_value, 
                                                   scale_min_label, scale_max_label, allow_custom_options, user_id)
                VALUES ('Quanto sei soddisfatto del tuo lavoro attuale?',
                        'Valuta il tuo livello di soddisfazione su una scala da 1 a 10',
                        'scale', 1, 10, 'Per niente soddisfatto', 'Completamente soddisfatto', false, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (3, 'Ambiente di lavoro', 0, :user_id), (3, 'Stipendio e benefit', 1, :user_id), (3, 'Opportunità di crescita', 2, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (3, 2, :user_id)"), {"user_id": admin_user_id})
            
            # Survey 4: Multiple Choice
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options, user_id)
                VALUES ('Quali sport pratichi regolarmente?', 
                        'Puoi selezionare più opzioni', 
                        'multiple_choice', true, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (4, 'Calcio', 0, :user_id), (4, 'Tennis', 1, :user_id), (4, 'Nuoto', 2, :user_id), 
                    (4, 'Palestra', 3, :user_id), (4, 'Corsa', 4, :user_id), (4, 'Ciclismo', 5, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (4, 3, :user_id)"), {"user_id": admin_user_id})
            
            # Survey 5: Date
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options, user_id)
                VALUES ('Quando sei disponibile per il team meeting?',
                        'Seleziona la data che preferisci o proponi una nuova data',
                        'date', true, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (5, '2024-11-15', 0, :user_id), (5, '2024-11-16', 1, :user_id), (5, '2024-11-17', 2, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (5, 2, :user_id)"), {"user_id": admin_user_id})
            
            # Survey 6: Open Text
            conn.execute(text("""
                INSERT INTO webdemocracy.surveys (title, description, question_type, allow_custom_options, user_id)
                VALUES ('Suggerimenti per migliorare Web Democracy',
                        'Condividi le tue idee e suggerimenti',
                        'open_text', true, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("""
                INSERT INTO webdemocracy.survey_options (survey_id, option_text, option_order, user_id) VALUES 
                    (6, 'Funzionalità mancanti', 0, :user_id), (6, 'Miglioramenti UI/UX', 1, :user_id), (6, 'Performance e velocità', 2, :user_id)
            """), {"user_id": admin_user_id})
            conn.execute(text("INSERT INTO webdemocracy.survey_tags (survey_id, tag_id, user_id) VALUES (6, 1, :user_id)"), {"user_id": admin_user_id})
            
            print("✅ 6 demo surveys inserted successfully")
        else:
            print(f"ℹ️  Surveys table already has {count} records, skipping demo surveys insertion")
    
    print("=" * 60)
    print("✨ Schema initialization complete!")
    print(f"📍 Location: database '{current_db}' → schema 'webdemocracy'")
    print(f"📊 Instance: {postgres_host}")
    print("=" * 60)


# Initialize schema on module import
print("🚀 About to initialize schema...")
try:
    initialize_schema()
    print("✅ Schema initialization completed successfully!")
except Exception as e:
    print(f"❌ FATAL ERROR initializing schema: {e}")
    import traceback
    traceback.print_exc()
    print("=" * 80)
    print("⚠️  DATABASE INITIALIZATION FAILED!")
    print("⚠️  The app may not function correctly.")
    print("=" * 80)
    # NON sollevo l'errore così l'app parte comunque e possiamo vedere i logs

