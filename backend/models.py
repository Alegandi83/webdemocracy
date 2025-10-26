from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# Enum per i tipi di domanda (validazione Python)
class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"  # Risposta singola (radio)
    MULTIPLE_CHOICE = "multiple_choice"  # Risposte multiple (checkbox)
    OPEN_TEXT = "open_text"  # Risposta aperta testuale
    SCALE = "scale"  # Scala numerica (es. 1-5, 1-10)
    RATING = "rating"  # Rating a stelle
    DATE = "date"  # Risposta data

# Tabella di associazione many-to-many per Survey e Tag
survey_tags = Table(
    'survey_tags',
    Base.metadata,
    Column('survey_id', Integer, ForeignKey('surveys.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(7), default="#6366f1")  # Colore esadecimale
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazione con i sondaggi
    surveys = relationship("Survey", secondary=survey_tags, back_populates="tags")

class Survey(Base):
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    question_type = Column(String(20), default=QuestionType.SINGLE_CHOICE.value, nullable=False)
    
    # Per domande di tipo scala/rating
    min_value = Column(Integer, default=1)
    max_value = Column(Integer, default=5)
    scale_min_label = Column(String(100))  # Es. "Molto insoddisfatto"
    scale_max_label = Column(String(100))  # Es. "Molto soddisfatto"
    
    # Scadenza e validità
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Opzioni
    allow_multiple_responses = Column(Boolean, default=False)  # Permetti voto multiplo dalla stessa persona
    allow_custom_options = Column(Boolean, default=False)  # Permetti agli utenti di aggiungere nuove opzioni
    require_comment = Column(Boolean, default=False)  # Richiedi commento obbligatorio
    rating_icon = Column(String(20), default="star")  # Icona per rating: "star", "heart", "number"
    
    # Relazioni
    options = relationship("SurveyOption", back_populates="survey", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="survey", cascade="all, delete-orphan")
    open_responses = relationship("OpenResponse", back_populates="survey", cascade="all, delete-orphan")
    likes = relationship("SurveyLike", back_populates="survey", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=survey_tags, back_populates="surveys")

class SurveyOption(Base):
    __tablename__ = "survey_options"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    option_text = Column(String(500), nullable=False)
    option_order = Column(Integer, default=0)  # Ordine di visualizzazione
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    survey = relationship("Survey", back_populates="options")
    votes = relationship("Vote", back_populates="option", cascade="all, delete-orphan")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    option_id = Column(Integer, ForeignKey("survey_options.id", ondelete="CASCADE"), nullable=True)  # Nullable per risposte aperte
    voter_ip = Column(String(45))
    voter_session = Column(String(100), index=True)  # Session ID per tracciare risposte multiple
    
    # Per risposte numeriche, scale, rating
    numeric_value = Column(Float, nullable=True)
    date_value = Column(DateTime(timezone=True), nullable=True)
    
    voted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    survey = relationship("Survey", back_populates="votes")
    option = relationship("SurveyOption", back_populates="votes")

class OpenResponse(Base):
    __tablename__ = "open_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    option_id = Column(Integer, ForeignKey("survey_options.id", ondelete="CASCADE"), nullable=True)  # Opzionale per compatibilità
    voter_ip = Column(String(45))
    voter_session = Column(String(100), index=True)
    response_text = Column(Text, nullable=False)
    responded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    survey = relationship("Survey", back_populates="open_responses")
    option = relationship("SurveyOption")

class SurveyLike(Base):
    __tablename__ = "survey_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    user_ip = Column(String(45))
    user_session = Column(String(100), index=True)
    rating = Column(Integer, nullable=False)  # 1-5 (pallini verdi)
    comment = Column(Text, nullable=True)  # Commento opzionale sul sondaggio
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazione
    survey = relationship("Survey", back_populates="likes")

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
