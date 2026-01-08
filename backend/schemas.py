from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any
from models import QuestionType, ClosureType

# ===== SCHEMI PER I TAG =====
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = "#6366f1"

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = None
    is_active: Optional[bool] = None

class Tag(TagBase):
    id: int
    is_active: bool = True
    created_at: datetime
    user_id: Optional[int] = None  # Nullable per tag di sistema
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER LE OPZIONI =====
class SurveyOptionBase(BaseModel):
    option_text: str
    option_order: Optional[int] = 0

class SurveyOptionCreate(SurveyOptionBase):
    pass

class SurveyOption(SurveyOptionBase):
    id: int
    survey_id: int
    created_at: datetime
    user_id: Optional[int] = None  # Nullable per opzioni create in sondaggi anonimi
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER I SONDAGGI =====
class SurveyBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    question_type: QuestionType = QuestionType.SINGLE_CHOICE
    
    # Per scale/rating
    min_value: Optional[int] = 1
    max_value: Optional[int] = 5
    scale_min_label: Optional[str] = None
    scale_max_label: Optional[str] = None
    
    # Chiusura e scadenza
    closure_type: ClosureType = ClosureType.PERMANENT
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True
    show_results_on_close: Optional[bool] = False
    
    # Opzioni aggiuntive
    allow_multiple_responses: Optional[bool] = False
    allow_custom_options: Optional[bool] = False
    require_comment: Optional[bool] = False
    rating_icon: Optional[str] = "star"  # "star", "heart", "number"
    is_anonymous: Optional[bool] = Field(default=False)
    
    # Resource fields
    resource_type: Optional[str] = "none"  # "none", "url", "news", "image"
    resource_url: Optional[str] = None
    resource_news_id: Optional[int] = None

class SurveyCreate(SurveyBase):
    options: List[str] = []  # Lista di testi delle opzioni (per choice questions)
    tag_ids: Optional[List[int]] = []  # ID dei tag da associare

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    closure_type: Optional[ClosureType] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    show_results_on_close: Optional[bool] = None
    is_anonymous: Optional[bool] = None
    resource_type: Optional[str] = None
    resource_url: Optional[str] = None
    resource_news_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None

class Survey(SurveyBase):
    id: int
    created_at: datetime
    user_id: int  # Creatore del sondaggio
    creator: Optional['UserBasic'] = None  # Informazioni del creatore
    options: List[SurveyOption] = []
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

class SurveyWithStats(Survey):
    total_votes: int = 0
    total_responses: int = 0
    unique_participants: int = 0
    participant_user_ids: List[int] = []
    average_like_rating: Optional[float] = None
    user_like_rating: Optional[int] = None  # Gradimento personale dell'utente (1-5)
    has_user_voted: bool = False

# ===== SCHEMI PER I VOTI =====
class OptionVote(BaseModel):
    """Voto per una singola opzione (per RATING/SCALE/NUMBER con opzioni)"""
    option_id: int
    numeric_value: Optional[float] = None  # Per RATING/SCALE/NUMBER
    
class OptionResponse(BaseModel):
    """Risposta per una singola opzione (per OPEN_TEXT con opzioni)"""
    option_id: int
    response_text: str

class VoteCreate(BaseModel):
    # Per SINGLE_CHOICE e MULTIPLE_CHOICE (backward compatibility)
    option_ids: Optional[List[int]] = []
    custom_option_text: Optional[str] = None
    
    # Per RATING/SCALE senza opzioni (backward compatibility)
    numeric_value: Optional[float] = None
    
    # Per DATE senza opzioni (backward compatibility)
    date_value: Optional[datetime] = None
    
    # Per OPEN_TEXT senza opzioni (backward compatibility) - rappresenta il testo della risposta aperta
    comment: Optional[str] = None
    
    # Per RATING/SCALE CON opzioni (nuova funzionalità)
    option_votes: Optional[List[OptionVote]] = []
    
    # Per OPEN_TEXT CON opzioni (nuova funzionalità)
    option_responses: Optional[List[OptionResponse]] = []
    
    # Gradimento e commento sul sondaggio (opzionali, inviati insieme al voto)
    like_rating: Optional[int] = None  # 1-5 pallini verdi
    survey_comment: Optional[str] = None  # Commento generale sul sondaggio

class Vote(BaseModel):
    id: int
    survey_id: int
    option_id: Optional[int] = None
    numeric_value: Optional[float] = None
    date_value: Optional[datetime] = None
    comment: Optional[str] = None
    voter_ip: Optional[str] = None
    voter_session: Optional[str] = None
    voted_at: datetime
    user_id: Optional[int] = None  # Nullable per voti anonimi
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER RISPOSTE APERTE =====
class OpenResponseCreate(BaseModel):
    response_text: str = Field(..., min_length=1)

class OpenResponse(BaseModel):
    id: int
    survey_id: int
    option_id: Optional[int] = None
    response_text: str
    voter_ip: Optional[str] = None
    voter_session: Optional[str] = None
    responded_at: datetime
    user_id: Optional[int] = None  # Nullable per risposte anonime
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER I RISULTATI =====
class SurveyResult(BaseModel):
    option_id: Optional[int] = None
    option_text: Optional[str] = None
    vote_count: int
    percentage: Optional[float] = None
    # Per risultati numerici per opzione (RATING/SCALE/NUMBER con opzioni)
    numeric_average: Optional[float] = None
    numeric_median: Optional[float] = None
    numeric_min: Optional[float] = None
    numeric_max: Optional[float] = None
    # Distribuzione dei voti per ogni valore di rating (per bubble chart)
    value_distribution: Optional[List['ValueDistribution']] = None

class NumericResultStats(BaseModel):
    average: float
    min_value: float
    max_value: float
    median: float
    count: int

class ValueDistribution(BaseModel):
    value: float
    count: int

class SurveyLikeComment(BaseModel):
    """Commento sul gradimento del sondaggio"""
    id: int
    survey_id: int
    rating: int
    comment: str
    created_at: datetime
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True

class SurveyResultsResponse(BaseModel):
    model_config = ConfigDict(exclude_none=False)
    
    survey_id: int
    survey_title: str
    question_type: QuestionType
    total_votes: int
    total_responses: int  # Numero di persone che hanno risposto
    results: List[SurveyResult] = []
    numeric_stats: Optional[NumericResultStats] = None
    value_distribution: Optional[List[ValueDistribution]] = None  # Per bar chart di rating e scale
    rating_icon: Optional[str] = None  # 'star', 'heart', 'number' per la visualizzazione
    min_value: Optional[int] = None  # Per sapere il range della scala
    max_value: Optional[int] = None
    like_stats: Optional['SurveyLikeStats'] = None  # Statistiche gradimento
    like_comments: List['SurveyLikeComment'] = []  # Commenti sul gradimento con nomi utente
    open_responses: List[OpenResponse] = []
    most_common_date: Optional[datetime] = None
    user_voted_option_ids: List[int] = []  # Lista degli ID delle opzioni votate dall'utente corrente (per sondaggi non anonimi)
    user_response_ids: List[int] = []  # Lista degli ID delle risposte aperte dell'utente corrente (per sondaggi non anonimi)
    user_numeric_votes: Optional[dict] = None  # Dict {option_id: numeric_value} per sondaggi SCALE/RATING non anonimi

# ===== SCHEMI PER LE STATISTICHE =====
class SurveyStats(BaseModel):
    survey_id: int
    survey_title: str
    survey_description: Optional[str] = None
    question_type: QuestionType
    closure_type: Optional[ClosureType] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    total_participants: int
    total_votes: int
    last_vote_at: Optional[datetime] = None
    options_count: int
    like_stats: Optional['SurveyLikeStats'] = None
    user_like_rating: Optional[int] = None  # Gradimento personale dell'utente (1-5)
    tags: List[Tag] = []
    has_user_voted: bool = False

# ===== SCHEMA PER FILTRI =====
class SurveyFilter(BaseModel):
    tag_ids: Optional[List[int]] = None
    question_type: Optional[QuestionType] = None
    is_active: Optional[bool] = None
    include_expired: Optional[bool] = False

# ===== SCHEMI PER I GRADIMENTI =====
class SurveyLikeCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)  # Da 1 a 5 pallini verdi
    comment: Optional[str] = None  # Commento opzionale sul sondaggio

class SurveyLike(BaseModel):
    id: int
    survey_id: int
    user_ip: Optional[str] = None
    user_session: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user_id: Optional[int] = None  # Nullable per like anonimi
    
    class Config:
        from_attributes = True

class SurveyLikeStats(BaseModel):
    average_rating: float
    total_likes: int
    rating_distribution: List[ValueDistribution]  # Distribuzione 1-5

# ===== SCHEMI PER I SETTINGS =====
class SettingsUpdate(BaseModel):
    key: str
    value: str

class Settings(BaseModel):
    id: int
    key: str
    value: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER GLI UTENTI =====
class UserBase(BaseModel):
    name: str
    email: str
    preferred_language: str = "it"

class UserBasic(BaseModel):
    """Schema base per informazioni utente (per nested objects)"""
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    profile_photo: Optional[str] = None
    gender: Optional[str] = None
    address_region: Optional[str] = None
    preferred_language: Optional[str] = None
    actual_geolocation: Optional[str] = None

class User(UserBase):
    id: int
    date_of_birth: Optional[datetime] = None
    profile_photo: Optional[str] = None
    user_role: str
    gender: Optional[str] = None
    address_region: Optional[str] = None
    registration_date: datetime
    actual_geolocation: Optional[str] = None
    last_login_date: Optional[datetime] = None
    last_ip_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ===== SCHEMI PER I GRUPPI =====
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupUserAssociation(BaseModel):
    user_ids: List[int]

class Group(GroupBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class GroupWithUsers(Group):
    users: List[UserBasic] = []
    
class GroupWithUserCount(Group):
    user_count: int = 0

# ===== SCHEMI PER LE NEWS =====
class NewsBase(BaseModel):
    # Author fields
    author: Optional[str] = None
    author_href: Optional[str] = None
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    
    # Content fields
    body: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    excerpt: Optional[str] = None
    headline: Optional[str] = None
    title: Optional[str] = None
    
    # URL fields
    canonical_url: Optional[str] = None
    href: Optional[str] = None
    url: Optional[str] = None
    paywall_url: Optional[str] = None
    
    # Media fields (JSON arrays)
    brands: Optional[List[Any]] = None
    images: Optional[List[Any]] = None
    videos: Optional[List[Any]] = None
    
    # Classification fields (JSON arrays)
    categories: Optional[List[str]] = None
    category: Optional[str] = None
    industries: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    keyword: Optional[str] = None
    topics: Optional[List[str]] = None
    entities: Optional[List[Dict[str, Any]]] = None
    locations: Optional[List[Dict[str, Any]]] = None
    organizations: Optional[List[Dict[str, Any]]] = None
    persons: Optional[List[Dict[str, Any]]] = None
    
    # Source fields
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    source_href: Optional[str] = None
    source_location: Optional[str] = None
    source_rank: Optional[int] = None
    source_categories: Optional[List[str]] = None
    publisher: Optional[str] = None
    
    # Metadata fields
    country: Optional[str] = None
    language: Optional[str] = None
    media: Optional[str] = None
    sentiment: Optional[str] = None
    
    # Date fields
    date: Optional[datetime] = None
    publication_date: Optional[datetime] = None
    published_at: Optional[datetime] = None
    updated_last: Optional[datetime] = None
    
    # Boolean flags
    is_breaking: bool = False
    is_duplicate: bool = False
    is_paywall: bool = False
    
    # Related articles (JSON array)
    related_articles: Optional[List[Dict[str, Any]]] = None
    
    # Image field (single image URL)
    image: Optional[str] = None

class NewsCreate(NewsBase):
    """Schema for creating a news article"""
    pass

class NewsUpdate(BaseModel):
    """Schema for updating a news article - all fields optional"""
    author: Optional[str] = None
    author_href: Optional[str] = None
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    body: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    excerpt: Optional[str] = None
    headline: Optional[str] = None
    title: Optional[str] = None
    canonical_url: Optional[str] = None
    href: Optional[str] = None
    url: Optional[str] = None
    paywall_url: Optional[str] = None
    brands: Optional[List[Any]] = None
    images: Optional[List[Any]] = None
    videos: Optional[List[Any]] = None
    categories: Optional[List[str]] = None
    category: Optional[str] = None
    industries: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    keyword: Optional[str] = None
    topics: Optional[List[str]] = None
    entities: Optional[List[Dict[str, Any]]] = None
    locations: Optional[List[Dict[str, Any]]] = None
    organizations: Optional[List[Dict[str, Any]]] = None
    persons: Optional[List[Dict[str, Any]]] = None
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    source_href: Optional[str] = None
    source_location: Optional[str] = None
    source_rank: Optional[int] = None
    source_categories: Optional[List[str]] = None
    publisher: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    media: Optional[str] = None
    sentiment: Optional[str] = None
    date: Optional[datetime] = None
    publication_date: Optional[datetime] = None
    published_at: Optional[datetime] = None
    updated_last: Optional[datetime] = None
    is_breaking: Optional[bool] = None
    is_duplicate: Optional[bool] = None
    is_paywall: Optional[bool] = None
    related_articles: Optional[List[Dict[str, Any]]] = None
    image: Optional[str] = None

class News(NewsBase):
    """Schema for reading a news article"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NewsList(BaseModel):
    """Schema for a list of news articles with pagination"""
    items: List[News]
    total: int
    page: int
    page_size: int
    total_pages: int

# Update forward references
Survey.model_rebuild()
