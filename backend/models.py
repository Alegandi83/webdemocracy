"""
Unified models.py - Works for both Databricks Apps and Local/Hybrid modes
Uses environment variable DEPLOY_MODE to determine schema usage
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Table, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import os

# Determine deployment mode from environment
DEPLOY_MODE = os.getenv("DEPLOY_MODE", "local").lower()  # local, hybrid, or databricks
USE_SCHEMA = DEPLOY_MODE in ["databricks", "hybrid"]  # Both use webdemocracy schema

# Import Base from appropriate connector
if DEPLOY_MODE == "databricks":
    from lakebase_connector import Base
    SCHEMA_NAME = 'webdemocracy'
elif DEPLOY_MODE == "hybrid":
    from database import Base  # database.py gestisce automaticamente Lakebase via USE_LAKEBASE
    SCHEMA_NAME = 'webdemocracy'
else:  # local
    from database import Base  # database.py usa PostgreSQL locale
    SCHEMA_NAME = None

print(f"🔧 Models initialized for mode: {DEPLOY_MODE} (schema: {SCHEMA_NAME or 'public'})")

# Enum per i tipi di domanda (validazione Python)
class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    OPEN_TEXT = "open_text"
    SCALE = "scale"
    RATING = "rating"
    DATE = "date"

# Enum per i tipi di chiusura sondaggio
class ClosureType(str, enum.Enum):
    PERMANENT = "permanent"      # Sondaggio permanente, sempre attivo
    SCHEDULED = "scheduled"      # Scadenza fissata, si chiude automaticamente
    MANUAL = "manual"            # Chiusura libera, chiudibile manualmente

# Helper function to create ForeignKey with optional schema
def fk(table_name: str, column: str = "id") -> str:
    """Create ForeignKey string with schema if needed"""
    if USE_SCHEMA and SCHEMA_NAME:
        return f"{SCHEMA_NAME}.{table_name}.{column}"
    return f"{table_name}.{column}"

# Helper function to get table_args with optional schema
def table_args():
    """Get __table_args__ dict with schema if needed"""
    if USE_SCHEMA and SCHEMA_NAME:
        return {'schema': SCHEMA_NAME}
    return None

# Tabella di associazione many-to-many per Survey e Tag
survey_tags_kwargs = {
    'metadata': Base.metadata,
}
if USE_SCHEMA and SCHEMA_NAME:
    survey_tags_kwargs['schema'] = SCHEMA_NAME

survey_tags = Table(
    'survey_tags',
    Base.metadata,
    Column('survey_id', Integer, ForeignKey(fk('surveys'), ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey(fk('tags'), ondelete='CASCADE'), primary_key=True),
    Column('user_id', Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=False),
    **({'schema': SCHEMA_NAME} if USE_SCHEMA and SCHEMA_NAME else {})
)

class Tag(Base):
    __tablename__ = "tags"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(7), default='#6366f1')
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='SET NULL'), nullable=True)  # Nullable per tag di sistema
    
    surveys = relationship("Survey", secondary=survey_tags, back_populates="tags")
    creator = relationship("User", back_populates="tags", foreign_keys=[user_id])

class Survey(Base):
    __tablename__ = "surveys"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    question_type = Column(String(20), default=QuestionType.SINGLE_CHOICE.value, nullable=False)
    
    min_value = Column(Integer, default=1)
    max_value = Column(Integer, default=5)
    scale_min_label = Column(String(100))
    scale_max_label = Column(String(100))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closure_type = Column(String(20), default=ClosureType.PERMANENT.value, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    show_results_on_close = Column(Boolean, default=False)
    
    allow_multiple_responses = Column(Boolean, default=False)
    allow_custom_options = Column(Boolean, default=False)
    require_comment = Column(Boolean, default=False)
    rating_icon = Column(String(20), default='star')
    is_anonymous = Column('is_anonymous', Boolean, default=False)
    
    # Resource fields
    resource_type = Column(String(20), default='none')  # none, url, news, image
    resource_url = Column(Text)  # URL for web link or uploaded image
    resource_news_id = Column(Integer, ForeignKey(fk('news'), ondelete='SET NULL'), nullable=True)  # Reference to news article
    
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=False)  # Creatore del sondaggio
    
    options = relationship("SurveyOption", back_populates="survey", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="survey", cascade="all, delete-orphan")
    open_responses = relationship("OpenResponse", back_populates="survey", cascade="all, delete-orphan")
    survey_likes = relationship("SurveyLike", back_populates="survey", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=survey_tags, back_populates="surveys")
    creator = relationship("User", back_populates="surveys", foreign_keys=[user_id])
    resource_news = relationship("News", foreign_keys=[resource_news_id])

class SurveyOption(Base):
    __tablename__ = "survey_options"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey(fk('surveys'), ondelete='CASCADE'), nullable=False)
    option_text = Column(String(500), nullable=False)
    option_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=True)  # Nullable per opzioni create in sondaggi anonimi
    
    survey = relationship("Survey", back_populates="options")
    votes = relationship("Vote", back_populates="option")
    open_responses = relationship("OpenResponse", back_populates="option")
    creator = relationship("User", back_populates="survey_options", foreign_keys=[user_id])

class Vote(Base):
    __tablename__ = "votes"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey(fk('surveys'), ondelete='CASCADE'), nullable=False)
    option_id = Column(Integer, ForeignKey(fk('survey_options'), ondelete='CASCADE'))
    voter_ip = Column(String(45))
    voter_session = Column(String(100))
    
    numeric_value = Column(Float)
    date_value = Column(DateTime(timezone=True))
    
    voted_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=True)  # Nullable per voti anonimi
    
    survey = relationship("Survey", back_populates="votes")
    option = relationship("SurveyOption", back_populates="votes")
    voter = relationship("User", back_populates="votes", foreign_keys=[user_id])

class OpenResponse(Base):
    __tablename__ = "open_responses"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey(fk('surveys'), ondelete='CASCADE'), nullable=False)
    option_id = Column(Integer, ForeignKey(fk('survey_options'), ondelete='CASCADE'))
    voter_ip = Column(String(45))
    voter_session = Column(String(100))
    response_text = Column(Text, nullable=False)
    responded_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=True)  # Nullable per risposte anonime
    
    survey = relationship("Survey", back_populates="open_responses")
    option = relationship("SurveyOption", back_populates="open_responses")
    responder = relationship("User", back_populates="open_responses", foreign_keys=[user_id])

class SurveyLike(Base):
    __tablename__ = "survey_likes"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey(fk('surveys'), ondelete='CASCADE'), nullable=False)
    user_ip = Column(String(45))
    user_session = Column(String(100))
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey(fk('user'), ondelete='CASCADE'), nullable=True)  # Nullable per like anonimi
    
    survey = relationship("Survey", back_populates="survey_likes")
    liker = relationship("User", back_populates="survey_likes", foreign_keys=[user_id])

class Settings(Base):
    __tablename__ = "settings"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Tabella di associazione per many-to-many user-groups
# DEVE essere definita PRIMA della classe User che la usa
user_groups = Table(
    'user_groups',
    Base.metadata,
    Column('user_id', Integer, ForeignKey(fk('user'), ondelete='CASCADE'), primary_key=True),
    Column('group_id', Integer, ForeignKey(fk('groups'), ondelete='CASCADE'), primary_key=True),
    Column('joined_at', DateTime(timezone=True), server_default=func.now()),
    schema=SCHEMA_NAME if USE_SCHEMA and SCHEMA_NAME else None
)

class User(Base):
    __tablename__ = "user"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    date_of_birth = Column(DateTime(timezone=False))  # Date only
    profile_photo = Column(Text)  # URL or base64
    user_role = Column(String(50), default='user')  # user, admin, pollster, editor
    gender = Column(String(50))
    address_region = Column(String(255))
    preferred_language = Column(String(10), default='it')
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    actual_geolocation = Column(String(255))  # GPS coordinates or location
    last_login_date = Column(DateTime(timezone=True))
    last_ip_address = Column(String(45))  # Supports IPv4 and IPv6
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships to entities created by this user
    surveys = relationship("Survey", back_populates="creator", foreign_keys="Survey.user_id")
    survey_options = relationship("SurveyOption", back_populates="creator", foreign_keys="SurveyOption.user_id")
    votes = relationship("Vote", back_populates="voter", foreign_keys="Vote.user_id")
    open_responses = relationship("OpenResponse", back_populates="responder", foreign_keys="OpenResponse.user_id")
    survey_likes = relationship("SurveyLike", back_populates="liker", foreign_keys="SurveyLike.user_id")
    tags = relationship("Tag", back_populates="creator", foreign_keys="Tag.user_id")
    
    # Relationships for groups
    created_groups = relationship("Group", back_populates="creator", foreign_keys="Group.created_by")
    groups = relationship("Group", secondary=user_groups, back_populates="users")

class Group(Base):
    __tablename__ = "groups"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey(fk('user'), ondelete='SET NULL'), nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="created_groups", foreign_keys=[created_by])
    users = relationship("User", secondary=user_groups, back_populates="groups")

class News(Base):
    __tablename__ = "news"
    if USE_SCHEMA and SCHEMA_NAME:
        __table_args__ = {'schema': SCHEMA_NAME}
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Author fields
    author = Column(String(255))
    author_href = Column(Text)
    author_id = Column(String(255))
    author_name = Column(String(255))
    
    # Content fields
    body = Column(Text)
    content = Column(Text)
    description = Column(Text)
    excerpt = Column(Text)
    headline = Column(String(500))
    title = Column(String(500))
    
    # URL fields
    canonical_url = Column(Text)
    href = Column(Text)
    url = Column(Text)
    paywall_url = Column(Text)
    
    # Media fields (JSON arrays)
    brands = Column(JSON)
    images = Column(JSON)
    videos = Column(JSON)
    
    # Classification fields (JSON arrays)
    categories = Column(JSON)
    category = Column(String(255))
    industries = Column(JSON)
    keywords = Column(JSON)
    keyword = Column(String(255))
    topics = Column(JSON)
    entities = Column(JSON)
    locations = Column(JSON)
    organizations = Column(JSON)
    persons = Column(JSON)
    
    # Source fields
    source_id = Column(String(255))
    source_name = Column(String(255))
    source_href = Column(Text)
    source_location = Column(String(255))
    source_rank = Column(Integer)
    source_categories = Column(JSON)
    publisher = Column(String(255))
    
    # Metadata fields
    country = Column(String(100))
    language = Column(String(50))
    media = Column(String(255))
    sentiment = Column(String(50))
    
    # Date fields
    date = Column(DateTime(timezone=True))
    publication_date = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    updated_last = Column(DateTime(timezone=True))
    
    # Boolean flags
    is_breaking = Column(Boolean, default=False)
    is_duplicate = Column(Boolean, default=False)
    is_paywall = Column(Boolean, default=False)
    
    # Related articles (JSON array)
    related_articles = Column(JSON)
    
    # Image field (single image URL)
    image = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

