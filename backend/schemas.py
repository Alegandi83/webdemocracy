from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from models import QuestionType

# ===== SCHEMI PER I TAG =====
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = "#6366f1"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: datetime
    
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
    
    # Scadenza
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True
    
    # Opzioni aggiuntive
    allow_multiple_responses: Optional[bool] = False
    allow_custom_options: Optional[bool] = False
    require_comment: Optional[bool] = False
    rating_icon: Optional[str] = "star"  # "star", "heart", "number"

class SurveyCreate(SurveyBase):
    options: List[str] = []  # Lista di testi delle opzioni (per choice questions)
    tag_ids: Optional[List[int]] = []  # ID dei tag da associare

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None

class Survey(SurveyBase):
    id: int
    created_at: datetime
    options: List[SurveyOption] = []
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

class SurveyWithStats(Survey):
    total_votes: int = 0
    total_responses: int = 0
    average_like_rating: Optional[float] = None

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

class NumericResultStats(BaseModel):
    average: float
    min_value: float
    max_value: float
    median: float
    count: int

class ValueDistribution(BaseModel):
    value: float
    count: int

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
    open_responses: List[OpenResponse] = []
    most_common_date: Optional[datetime] = None

# ===== SCHEMI PER LE STATISTICHE =====
class SurveyStats(BaseModel):
    survey_id: int
    survey_title: str
    survey_description: Optional[str] = None
    question_type: QuestionType
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    total_participants: int
    total_votes: int
    last_vote_at: Optional[datetime] = None
    options_count: int
    like_stats: Optional['SurveyLikeStats'] = None
    tags: List[Tag] = []

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
