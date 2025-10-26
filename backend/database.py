from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configurazione database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://survey_user:survey_password@localhost:5432/survey_db")

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
