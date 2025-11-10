from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List, Optional
from datetime import datetime, timezone
from collections import Counter
import uuid
import models, schemas
from database import engine, get_db

# Creazione tabelle
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Web Democracy API", version="2.0.0")

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Web Democracy API v2.0.0 - Democratic Decision Platform"}

@app.get("/api/user")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current user information from database"""
    user_email = "demo@local.dev"  # In locale sempre demo user
    user_ip = request.client.host if request.client else "127.0.0.1"
    
    # Cerca l'utente nel database per email
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    
    # Se l'utente non esiste, crealo
    if not user_db:
        user_db = models.User(
            name="Demo User",
            email=user_email,
            user_role="user",
            preferred_language="it"
        )
        db.add(user_db)
        db.commit()
        db.refresh(user_db)
    
    # Aggiorna last_login_date e last_ip_address
    user_db.last_login_date = datetime.now()
    user_db.last_ip_address = user_ip
    db.commit()
    
    # Determina i permessi basandosi sul ruolo
    is_admin = user_db.user_role == "admin"
    is_pollster = user_db.user_role in ["admin", "pollster"]
    
    return {
        "id": user_db.id,
        "name": user_db.name,
        "email": user_db.email,
        "user_role": user_db.user_role,
        "profile_photo": user_db.profile_photo,
        "date_of_birth": user_db.date_of_birth.isoformat() if user_db.date_of_birth else None,
        "gender": user_db.gender,
        "address_region": user_db.address_region,
        "preferred_language": user_db.preferred_language,
        "registration_date": user_db.registration_date.isoformat() if user_db.registration_date else None,
        "actual_geolocation": user_db.actual_geolocation,
        "last_login_date": user_db.last_login_date.isoformat() if user_db.last_login_date else None,
        "last_ip_address": user_db.last_ip_address,
        "is_local": True,
        "is_admin": is_admin,
        "is_pollster": is_pollster
    }

@app.get("/api/user/profile")
async def get_user_profile(request: Request, db: Session = Depends(get_db)):
    """Get full user profile"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_db

@app.put("/api/user/profile")
async def update_user_profile(
    request: Request,
    profile_data: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_db, field, value)
    
    user_db.updated_at = datetime.now()
    db.commit()
    db.refresh(user_db)
    
    return user_db

@app.get("/api/user/is-admin")
async def check_is_admin(request: Request, db: Session = Depends(get_db)):
    """Check if current user is admin"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db:
        return {"is_admin": False}
    
    return {"is_admin": user_db.user_role == "admin"}

# ===== ENDPOINTS PER GESTIONE UTENTI (ADMIN ONLY) =====

@app.get("/api/users")
async def get_all_users(request: Request, db: Session = Depends(get_db)):
    """Get all users - Admin only"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db or user_db.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli amministratori possono visualizzare gli utenti")
    
    users = db.query(models.User).order_by(models.User.id).all()
    return users

@app.put("/api/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_data: dict,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update user role - Admin only"""
    user_email = "demo@local.dev"
    
    admin_user = db.query(models.User).filter(models.User.email == user_email).first()
    if not admin_user or admin_user.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli amministratori possono modificare i ruoli")
    
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    new_role = role_data.get("user_role")
    if new_role not in ["user", "admin", "pollster"]:
        raise HTTPException(status_code=400, detail="Ruolo non valido")
    
    target_user.user_role = new_role
    target_user.updated_at = datetime.now()
    db.commit()
    db.refresh(target_user)
    
    return target_user

# ===== ENDPOINTS PER GESTIONE DATI (ADMIN ONLY) =====

@app.delete("/api/surveys/all")
async def delete_all_surveys(request: Request, db: Session = Depends(get_db)):
    """Delete all surveys, votes, and options - Admin only"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db or user_db.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli amministratori possono eliminare tutti i sondaggi")
    
    # Elimina in cascata: prima i voti, poi le opzioni, poi i sondaggi
    surveys_count = db.query(models.Survey).count()
    db.query(models.Vote).delete()
    db.query(models.OpenResponse).delete()
    db.query(models.SurveyLike).delete()
    db.query(models.SurveyOption).delete()
    db.query(models.Survey).delete()
    db.commit()
    
    return {"message": f"Eliminati {surveys_count} sondaggi e tutti i dati associati"}

@app.post("/api/surveys/test-data")
async def create_test_surveys(request: Request, db: Session = Depends(get_db)):
    """Create test surveys (one for each question type) - Admin only"""
    user_email = "demo@local.dev"
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db or user_db.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli amministratori possono creare dati di test")
    
    # Dati di test per ogni tipo di sondaggio
    test_surveys = [
        {
            "title": "Qual è il tuo linguaggio di programmazione preferito?",
            "description": "Sondaggio di test - Scelta Singola",
            "question_type": models.QuestionType.SINGLE_CHOICE,
            "options": ["Python", "JavaScript", "Java", "C++", "Go", "Rust"]
        },
        {
            "title": "Quali framework web hai usato?",
            "description": "Sondaggio di test - Scelta Multipla",
            "question_type": models.QuestionType.MULTIPLE_CHOICE,
            "allow_multiple_responses": True,
            "options": ["React", "Vue", "Angular", "Django", "Flask", "Express.js"]
        },
        {
            "title": "Cosa ne pensi dell'intelligenza artificiale?",
            "description": "Sondaggio di test - Testo Aperto",
            "question_type": models.QuestionType.OPEN_TEXT,
            "options": []
        },
        {
            "title": "Quanto ti piace programmare?",
            "description": "Sondaggio di test - Scala",
            "question_type": models.QuestionType.SCALE,
            "min_value": 1,
            "max_value": 10,
            "scale_min_label": "Per niente",
            "scale_max_label": "Moltissimo",
            "options": []
        },
        {
            "title": "Valuta la tua esperienza con Python",
            "description": "Sondaggio di test - Rating",
            "question_type": models.QuestionType.RATING,
            "min_value": 1,
            "max_value": 5,
            "rating_icon": "star",
            "options": []
        },
        {
            "title": "Quando hai iniziato a programmare?",
            "description": "Sondaggio di test - Data",
            "question_type": models.QuestionType.DATE,
            "options": []
        }
    ]
    
    created_surveys = []
    for survey_data in test_surveys:
        # Crea sondaggio
        options = survey_data.pop("options", [])
        db_survey = models.Survey(**survey_data)
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        # Aggiungi opzioni se presenti
        for idx, option_text in enumerate(options):
            db_option = models.SurveyOption(
                survey_id=db_survey.id,
                option_text=option_text,
                option_order=idx
            )
            db.add(db_option)
        
        db.commit()
        created_surveys.append(db_survey.title)
    
    return {"message": f"Creati {len(created_surveys)} sondaggi di test", "surveys": created_surveys}

# ===== ENDPOINTS PER I TAG =====

@app.get("/tags", response_model=List[schemas.Tag])
def get_tags(include_inactive: bool = False, db: Session = Depends(get_db)):
    """Ottieni i tag disponibili (solo attivi di default)"""
    query = db.query(models.Tag)
    if not include_inactive:
        query = query.filter(models.Tag.is_active == True)
    return query.all()

@app.post("/tags", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    """Crea un nuovo tag"""
    # Verifica se esiste già
    existing = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag già esistente")
    
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.put("/api/tags/{tag_id}", response_model=schemas.Tag)
async def update_tag(tag_id: int, tag_update: schemas.TagUpdate, request: Request, db: Session = Depends(get_db)):
    """Aggiorna un tag esistente (solo admin)"""
    # Verifica che l'utente sia admin (in locale: demo@local.dev)
    user_email = "demo@local.dev"
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    
    if not user_db or user_db.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli admin possono modificare i tag")
    
    # Trova il tag
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag non trovato")
    
    # Verifica unicità del nome se viene cambiato
    if tag_update.name and tag_update.name != db_tag.name:
        existing = db.query(models.Tag).filter(models.Tag.name == tag_update.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Esiste già un tag con questo nome")
    
    # Aggiorna i campi
    update_data = tag_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tag, field, value)
    
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.put("/api/tags/{tag_id}/toggle", response_model=schemas.Tag)
async def toggle_tag(tag_id: int, request: Request, db: Session = Depends(get_db)):
    """Attiva/Disattiva un tag (solo admin)"""
    # Verifica che l'utente sia admin (in locale: demo@local.dev)
    user_email = "demo@local.dev"
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    
    if not user_db or user_db.user_role != "admin":
        raise HTTPException(status_code=403, detail="Solo gli admin possono attivare/disattivare i tag")
    
    # Trova il tag
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag non trovato")
    
    # Toggle is_active
    db_tag.is_active = not db_tag.is_active
    db.commit()
    db.refresh(db_tag)
    return db_tag

# ===== ENDPOINTS PER I SONDAGGI =====

@app.get("/surveys", response_model=List[schemas.SurveyWithStats])
def get_surveys(
    tag_ids: Optional[str] = None,
    question_type: Optional[models.QuestionType] = None,
    is_active: Optional[bool] = None,
    include_expired: bool = False,
    db: Session = Depends(get_db)
):
    """Ottieni tutti i sondaggi con filtri opzionali"""
    query = db.query(models.Survey)
    
    # Filtro per tag
    if tag_ids:
        tag_id_list = [int(x) for x in tag_ids.split(',')]
        query = query.join(models.survey_tags).filter(models.survey_tags.c.tag_id.in_(tag_id_list))
    
    # Filtro per tipo
    if question_type:
        query = query.filter(models.Survey.question_type == question_type)
    
    # Filtro per stato attivo
    if is_active is not None:
        query = query.filter(models.Survey.is_active == is_active)
    
    # Filtro scadenza
    if not include_expired:
        # Filtra per scadenza (usa UTC naive per compatibilità)
        now_naive = datetime.utcnow()
        query = query.filter(
            or_(
                models.Survey.expires_at.is_(None),
                models.Survey.expires_at > now_naive
            )
        )
    
    surveys = query.all()
    
    # Aggiungi statistiche a ogni sondaggio
    result = []
    for survey in surveys:
        survey_dict = schemas.Survey.from_orm(survey).dict()
        
        # Calcola average_like_rating
        likes = db.query(models.SurveyLike).filter(
            models.SurveyLike.survey_id == survey.id
        ).all()
        
        if likes:
            ratings = [like.rating for like in likes]
            average_like_rating = round(sum(ratings) / len(ratings), 2)
        else:
            average_like_rating = None
        
        # Calcola total_votes (numero totale di voti ricevuti)
        total_votes = db.query(models.Vote).filter(
            models.Vote.survey_id == survey.id
        ).count()
        
        survey_dict['average_like_rating'] = average_like_rating
        survey_dict['total_votes'] = total_votes
        survey_dict['total_responses'] = total_votes  # Per compatibilità
        
        result.append(schemas.SurveyWithStats(**survey_dict))
    
    return result

@app.get("/surveys/{survey_id}", response_model=schemas.Survey)
def get_survey(survey_id: int, db: Session = Depends(get_db)):
    """Ottieni un singolo sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    # Verifica scadenza
    if survey.expires_at:
        # Normalizza datetime per il confronto (rimuovi timezone se presente)
        expires_naive = survey.expires_at.replace(tzinfo=None) if survey.expires_at.tzinfo else survey.expires_at
        now_naive = datetime.utcnow()
        if expires_naive < now_naive:
            survey.is_active = False
            db.commit()
            db.refresh(survey)
    
    return survey

@app.post("/surveys", response_model=schemas.Survey)
async def create_survey(request: Request, survey: schemas.SurveyCreate, db: Session = Depends(get_db)):
    """Crea un nuovo sondaggio - Solo per admin e pollster"""
    # Verifica permessi
    user_email = "demo@local.dev"  # In locale sempre demo user
    
    user_db = db.query(models.User).filter(models.User.email == user_email).first()
    if not user_db or user_db.user_role not in ["admin", "pollster"]:
        raise HTTPException(
            status_code=403, 
            detail="Solo gli amministratori e i pollster possono creare sondaggi"
        )
    
    # Creazione sondaggio
    survey_dict = survey.dict(exclude={'options', 'tag_ids'})
    db_survey = models.Survey(**survey_dict)
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    
    # Aggiungi opzioni (per tutti i tipi di domanda se fornite)
    if survey.options:
        for idx, option_text in enumerate(survey.options):
            db_option = models.SurveyOption(
                survey_id=db_survey.id,
                option_text=option_text,
                option_order=idx
            )
            db.add(db_option)
    
    # Aggiungi tag
    if survey.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(survey.tag_ids)).all()
        db_survey.tags = tags
    
    db.commit()
    db.refresh(db_survey)
    return db_survey

@app.patch("/surveys/{survey_id}", response_model=schemas.Survey)
def update_survey(survey_id: int, survey_update: schemas.SurveyUpdate, db: Session = Depends(get_db)):
    """Aggiorna un sondaggio"""
    db_survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not db_survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    # Aggiorna campi
    update_data = survey_update.dict(exclude_unset=True, exclude={'tag_ids'})
    for field, value in update_data.items():
        setattr(db_survey, field, value)
    
    # Aggiorna tag se forniti
    if survey_update.tag_ids is not None:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(survey_update.tag_ids)).all()
        db_survey.tags = tags
    
    db.commit()
    db.refresh(db_survey)
    return db_survey

@app.delete("/surveys/{survey_id}")
def delete_survey(survey_id: int, db: Session = Depends(get_db)):
    """Elimina un sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    db.delete(survey)
    db.commit()
    return {"message": f"Sondaggio '{survey.title}' eliminato con successo"}

@app.delete("/surveys")
def delete_all_surveys(db: Session = Depends(get_db)):
    """Elimina tutti i sondaggi"""
    # Conta i sondaggi prima di cancellarli
    count = db.query(models.Survey).count()
    
    # Cancella tutti i sondaggi (le relazioni vengono cancellate in cascata)
    db.query(models.Survey).delete()
    db.commit()
    
    return {"message": f"Eliminati {count} sondaggi con successo", "deleted_count": count}

# ===== ENDPOINTS PER VOTARE =====

def get_or_create_session(request: Request) -> str:
    """Ottieni o crea una session ID per il votante"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id

@app.post("/surveys/{survey_id}/vote")
def vote_survey(
    survey_id: int,
    vote: schemas.VoteCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Vota in un sondaggio"""
    # Verifica sondaggio
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    # Verifica se attivo
    if not survey.is_active:
        raise HTTPException(status_code=400, detail="Sondaggio non più attivo")
    
    # Verifica scadenza
    if survey.expires_at:
        # Normalizza datetime per il confronto (rimuovi timezone se presente)
        expires_naive = survey.expires_at.replace(tzinfo=None) if survey.expires_at.tzinfo else survey.expires_at
        now_naive = datetime.utcnow()
        if expires_naive < now_naive:
            survey.is_active = False
            db.commit()
            db.refresh(survey)
            raise HTTPException(status_code=400, detail="Sondaggio scaduto")
    
    # Ottieni session
    client_ip = request.client.host
    session_id = get_or_create_session(request)
    
    # Verifica se ha già votato (se non permessi voti multipli)
    if not survey.allow_multiple_responses:
        existing = db.query(models.Vote).filter(
            models.Vote.survey_id == survey_id,
            or_(
                models.Vote.voter_ip == client_ip,
                models.Vote.voter_session == session_id
            )
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Hai già votato in questo sondaggio")
    
    # Gestione voto in base al tipo
    if survey.question_type == models.QuestionType.SINGLE_CHOICE:
        # Singola scelta
        option_id = None
        
        # Se è stata fornita una custom option
        if vote.custom_option_text:
            if not survey.allow_custom_options:
                raise HTTPException(status_code=400, detail="Opzioni personalizzate non permesse per questo sondaggio")
            
            # Crea nuova opzione
            new_option = models.SurveyOption(
                survey_id=survey_id,
                option_text=vote.custom_option_text.strip(),
                option_order=999  # Mettila alla fine
            )
            db.add(new_option)
            db.flush()  # Per ottenere l'ID
            option_id = new_option.id
        
        elif vote.option_ids and len(vote.option_ids) == 1:
            option_id = vote.option_ids[0]
            option = db.query(models.SurveyOption).filter(
                models.SurveyOption.id == option_id,
                models.SurveyOption.survey_id == survey_id
            ).first()
            if not option:
                raise HTTPException(status_code=400, detail="Opzione non valida")
        else:
            raise HTTPException(status_code=400, detail="Seleziona esattamente un'opzione o inserisci una nuova")
        
        db_vote = models.Vote(
            survey_id=survey_id,
            option_id=option_id,
            voter_ip=client_ip,
            voter_session=session_id
        )
        db.add(db_vote)
    
    elif survey.question_type == models.QuestionType.MULTIPLE_CHOICE:
        # Scelte multiple
        option_ids_to_vote = []
        
        # Gestisci custom option
        if vote.custom_option_text:
            if not survey.allow_custom_options:
                raise HTTPException(status_code=400, detail="Opzioni personalizzate non permesse per questo sondaggio")
            
            # Crea nuova opzione
            new_option = models.SurveyOption(
                survey_id=survey_id,
                option_text=vote.custom_option_text.strip(),
                option_order=999
            )
            db.add(new_option)
            db.flush()
            option_ids_to_vote.append(new_option.id)
        
        # Aggiungi opzioni esistenti
        if vote.option_ids:
            option_ids_to_vote.extend(vote.option_ids)
        
        if not option_ids_to_vote:
            raise HTTPException(status_code=400, detail="Seleziona almeno un'opzione")
        
        # Salva il commento solo nel primo voto (per evitare duplicazione)
        for idx, option_id in enumerate(option_ids_to_vote):
            option = db.query(models.SurveyOption).filter(
                models.SurveyOption.id == option_id,
                models.SurveyOption.survey_id == survey_id
            ).first()
            if not option:
                raise HTTPException(status_code=400, detail=f"Opzione {option_id} non valida")
            
            db_vote = models.Vote(
                survey_id=survey_id,
                option_id=option_id,
                voter_ip=client_ip,
                voter_session=session_id
            )
            db.add(db_vote)
    
    elif survey.question_type == models.QuestionType.OPEN_TEXT:
        # Risposta aperta
        # Controlla se ci sono opzioni nel sondaggio
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        if survey_options:
            # Nuova modalità: risposta per ogni opzione
            if vote.option_responses:
                for option_response in vote.option_responses:
                    # Verifica che l'opzione esista
                    option = db.query(models.SurveyOption).filter(
                        models.SurveyOption.id == option_response.option_id,
                        models.SurveyOption.survey_id == survey_id
                    ).first()
                    if not option:
                        raise HTTPException(status_code=400, detail=f"Opzione {option_response.option_id} non valida")
                    
                    if option_response.response_text and option_response.response_text.strip():
                        db_response = models.OpenResponse(
                            survey_id=survey_id,
                            option_id=option_response.option_id,
                            voter_ip=client_ip,
                            voter_session=session_id,
                            response_text=option_response.response_text.strip()
                        )
                        db.add(db_response)
            
            # Gestisci opzione personalizzata con risposta (sempre, se presente)
            if vote.custom_option_text and vote.comment:
                if not survey.allow_custom_options:
                    raise HTTPException(status_code=400, detail="Opzioni personalizzate non permesse per questo sondaggio")
                
                # Crea nuova opzione
                new_option = models.SurveyOption(
                    survey_id=survey_id,
                    option_text=vote.custom_option_text.strip(),
                    option_order=999
                )
                db.add(new_option)
                db.flush()
                
                # Aggiungi la risposta per la nuova opzione
                db_response = models.OpenResponse(
                    survey_id=survey_id,
                    option_id=new_option.id,
                    voter_ip=client_ip,
                    voter_session=session_id,
                    response_text=vote.comment.strip()
                )
                db.add(db_response)
            
            # Verifica che almeno una risposta sia stata registrata
            if not vote.option_responses and not (vote.custom_option_text and vote.comment):
                raise HTTPException(status_code=400, detail="Inserisci almeno una risposta")
        else:
            # Backward compatibility: risposta singola senza opzioni
            if not vote.comment:
                raise HTTPException(status_code=400, detail="Inserisci una risposta")
            
            db_response = models.OpenResponse(
                survey_id=survey_id,
                voter_ip=client_ip,
                voter_session=session_id,
                response_text=vote.comment
            )
            db.add(db_response)
    
    elif survey.question_type in [models.QuestionType.SCALE, models.QuestionType.RATING]:
        # Valore numerico
        # Controlla se ci sono opzioni nel sondaggio
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        if survey_options:
            # Nuova modalità: voto per ogni opzione
            if vote.option_votes:
                for idx, option_vote in enumerate(vote.option_votes):
                    # Verifica che l'opzione esista
                    option = db.query(models.SurveyOption).filter(
                        models.SurveyOption.id == option_vote.option_id,
                        models.SurveyOption.survey_id == survey_id
                    ).first()
                    if not option:
                        raise HTTPException(status_code=400, detail=f"Opzione {option_vote.option_id} non valida")
                    
                    # Valida il valore se fornito
                    if option_vote.numeric_value is not None:
                        if survey.question_type in [models.QuestionType.SCALE, models.QuestionType.RATING]:
                            if not (survey.min_value <= option_vote.numeric_value <= survey.max_value):
                                raise HTTPException(
                                    status_code=400,
                                    detail=f"Valore deve essere tra {survey.min_value} e {survey.max_value}"
                                )
                        
                        db_vote = models.Vote(
                            survey_id=survey_id,
                            option_id=option_vote.option_id,
                            numeric_value=option_vote.numeric_value,
                            voter_ip=client_ip,
                            voter_session=session_id
                        )
                        db.add(db_vote)
            
            # Gestisci opzione personalizzata con voto (sempre, se presente)
            if vote.custom_option_text and vote.numeric_value is not None:
                if not survey.allow_custom_options:
                    raise HTTPException(status_code=400, detail="Opzioni personalizzate non permesse per questo sondaggio")
                
                # Valida il valore
                if not (survey.min_value <= vote.numeric_value <= survey.max_value):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Valore deve essere tra {survey.min_value} e {survey.max_value}"
                    )
                
                # Crea nuova opzione
                new_option = models.SurveyOption(
                    survey_id=survey_id,
                    option_text=vote.custom_option_text.strip(),
                    option_order=999
                )
                db.add(new_option)
                db.flush()
                
                # Vota per la nuova opzione
                db_vote = models.Vote(
                    survey_id=survey_id,
                    option_id=new_option.id,
                    numeric_value=vote.numeric_value,
                    voter_ip=client_ip,
                    voter_session=session_id
                )
                db.add(db_vote)
            
            # Verifica che almeno un voto sia stato registrato
            if not vote.option_votes and not (vote.custom_option_text and vote.numeric_value):
                raise HTTPException(status_code=400, detail="Inserisci almeno una valutazione")
        else:
            # Backward compatibility: voto singolo senza opzioni
            if vote.numeric_value is None:
                raise HTTPException(status_code=400, detail="Inserisci un valore numerico")
            
            # Valida range per scale e rating
            if survey.question_type in [models.QuestionType.SCALE, models.QuestionType.RATING]:
                if not (survey.min_value <= vote.numeric_value <= survey.max_value):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Valore deve essere tra {survey.min_value} e {survey.max_value}"
                    )
            
            db_vote = models.Vote(
                survey_id=survey_id,
                numeric_value=vote.numeric_value,
                voter_ip=client_ip,
                voter_session=session_id
            )
            db.add(db_vote)
    
    elif survey.question_type == models.QuestionType.DATE:
        # Valore data
        # Controlla se ci sono opzioni nel sondaggio
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        if survey_options:
            # Con opzioni: l'utente può scegliere un'opzione o proporre una nuova data
            option_id = None
            
            # Se l'utente ha selezionato un'opzione esistente
            if vote.option_ids and len(vote.option_ids) > 0:
                option_id = vote.option_ids[0]
                option = db.query(models.SurveyOption).filter(
                    models.SurveyOption.id == option_id,
                    models.SurveyOption.survey_id == survey_id
                ).first()
                if not option:
                    raise HTTPException(status_code=400, detail="Opzione non valida")
                
                # Vota per l'opzione selezionata
                db_vote = models.Vote(
                    survey_id=survey_id,
                    option_id=option_id,
                    voter_ip=client_ip,
                    voter_session=session_id
                )
                db.add(db_vote)
            
            # Se l'utente propone una nuova data
            elif vote.date_value:
                if not survey.allow_custom_options:
                    raise HTTPException(status_code=400, detail="Non è possibile proporre nuove date per questo sondaggio")
                
                # Crea una nuova opzione con la data proposta in formato ISO (yyyy-mm-dd)
                date_str = vote.date_value.strftime("%Y-%m-%d")
                new_option = models.SurveyOption(
                    survey_id=survey_id,
                    option_text=date_str,
                    option_order=999
                )
                db.add(new_option)
                db.flush()
                
                db_vote = models.Vote(
                    survey_id=survey_id,
                    option_id=new_option.id,
                    date_value=vote.date_value,
                    voter_ip=client_ip,
                    voter_session=session_id
                )
                db.add(db_vote)
            else:
                raise HTTPException(status_code=400, detail="Seleziona una data o proponi una nuova")
        else:
            # Backward compatibility: data singola senza opzioni
            if vote.date_value is None:
                raise HTTPException(status_code=400, detail="Inserisci una data")
            
            db_vote = models.Vote(
                survey_id=survey_id,
                date_value=vote.date_value,
                voter_ip=client_ip,
                voter_session=session_id
            )
            db.add(db_vote)
    
    # Nota: require_comment serve solo per mostrare il campo commento nel frontend,
    # ma il commento è sempre opzionale per l'utente
    
    # Salva gradimento e commento del sondaggio se forniti
    if vote.like_rating is not None or vote.survey_comment is not None:
        # Cerca se esiste già un like per questo utente
        existing_like = db.query(models.SurveyLike).filter(
            models.SurveyLike.survey_id == survey_id,
            or_(
                models.SurveyLike.user_ip == client_ip,
                models.SurveyLike.user_session == session_id
            )
        ).first()
        
        if existing_like:
            # Aggiorna il like esistente
            if vote.like_rating is not None:
                existing_like.rating = vote.like_rating
            if vote.survey_comment is not None:
                existing_like.comment = vote.survey_comment
        else:
            # Crea un nuovo like
            # Se manca il rating ma c'è il commento, imposta rating a 0 (nessun gradimento ma con commento)
            rating_value = vote.like_rating if vote.like_rating is not None else 0
            
            db_like = models.SurveyLike(
                survey_id=survey_id,
                user_ip=client_ip,
                user_session=session_id,
                rating=rating_value,
                comment=vote.survey_comment
            )
            db.add(db_like)
    
    db.commit()
    return {"message": "Voto registrato con successo", "session_id": session_id}

# ===== ENDPOINTS PER RISULTATI =====

@app.get("/surveys/{survey_id}/results", response_model=schemas.SurveyResultsResponse)
def get_survey_results(survey_id: int, db: Session = Depends(get_db)):
    """Ottieni i risultati di un sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    results = []
    numeric_stats = None
    value_distribution = None
    open_responses = []
    most_common_date = None
    total_votes = 0
    total_responses = 0
    
    if survey.question_type in [models.QuestionType.SINGLE_CHOICE, models.QuestionType.MULTIPLE_CHOICE]:
        # Risultati per choice
        result_query = db.query(
            models.SurveyOption.id,
            models.SurveyOption.option_text,
            func.count(models.Vote.id).label('vote_count')
        ).outerjoin(models.Vote).filter(
            models.SurveyOption.survey_id == survey_id
        ).group_by(models.SurveyOption.id).all()
        
        total_votes = sum(r.vote_count for r in result_query)
        
        results = [
            schemas.SurveyResult(
                option_id=r.id,
                option_text=r.option_text,
                vote_count=r.vote_count,
                percentage=round((r.vote_count / total_votes * 100), 2) if total_votes > 0 else 0
            )
            for r in result_query
        ]
        
        # Per multiple choice, conta risposte uniche
        total_responses = db.query(models.Vote.voter_session).filter(
            models.Vote.survey_id == survey_id
        ).distinct().count()
    
    elif survey.question_type == models.QuestionType.OPEN_TEXT:
        # Risposte aperte
        # Controlla se ci sono opzioni nel sondaggio
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        open_responses_query = db.query(models.OpenResponse).filter(
            models.OpenResponse.survey_id == survey_id
        ).all()
        
        open_responses = [schemas.OpenResponse.from_orm(r) for r in open_responses_query]
        total_votes = len(open_responses)
        total_responses = total_votes
        
        # Se ci sono opzioni, crea anche un conteggio per opzione
        if survey_options:
            for option in survey_options:
                option_responses_count = sum(1 for r in open_responses_query if r.option_id == option.id)
                results.append(schemas.SurveyResult(
                    option_id=option.id,
                    option_text=option.option_text,
                    vote_count=option_responses_count
                ))
    
    elif survey.question_type in [models.QuestionType.SCALE, models.QuestionType.RATING]:
        # Statistiche numeriche
        # Controlla se ci sono opzioni nel sondaggio
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        if survey_options:
            # Con opzioni: mostra risultati per ogni opzione
            for option in survey_options:
                option_votes = db.query(models.Vote.numeric_value).filter(
                    models.Vote.survey_id == survey_id,
                    models.Vote.option_id == option.id,
                    models.Vote.numeric_value.isnot(None)
                ).all()
                
                if option_votes:
                    values = [v[0] for v in option_votes]
                    values_sorted = sorted(values)
                    median = values_sorted[len(values_sorted) // 2] if values_sorted else 0
                    
                    results.append(schemas.SurveyResult(
                        option_id=option.id,
                        option_text=option.option_text,
                        vote_count=len(values),
                        numeric_average=round(sum(values) / len(values), 2),
                        numeric_median=median,
                        numeric_min=min(values),
                        numeric_max=max(values)
                    ))
                    total_votes += len(values)
                else:
                    results.append(schemas.SurveyResult(
                        option_id=option.id,
                        option_text=option.option_text,
                        vote_count=0
                    ))
            
            total_responses = total_votes
        else:
            # Backward compatibility: statistiche senza opzioni
            numeric_values = db.query(models.Vote.numeric_value).filter(
                models.Vote.survey_id == survey_id,
                models.Vote.numeric_value.isnot(None)
            ).all()
            
            if numeric_values:
                values = [v[0] for v in numeric_values]
                total_votes = len(values)
                total_responses = total_votes
                
                values_sorted = sorted(values)
                median = values_sorted[len(values_sorted) // 2] if values_sorted else 0
                
                numeric_stats = schemas.NumericResultStats(
                    average=round(sum(values) / len(values), 2),
                    min_value=min(values),
                    max_value=max(values),
                    median=median,
                    count=len(values)
                )
                
                # Per RATING e SCALE, calcola la distribuzione dei valori
                if survey.question_type in [models.QuestionType.SCALE, models.QuestionType.RATING]:
                    # Conta le occorrenze per ogni valore
                    value_counts = Counter(values)
                    
                    # Crea una lista con tutti i valori possibili da min_value a max_value
                    distribution = []
                    for val in range(survey.min_value, survey.max_value + 1):
                        distribution.append(schemas.ValueDistribution(
                            value=float(val),
                            count=value_counts.get(float(val), 0)
                        ))
                    
                    value_distribution = distribution
    
    elif survey.question_type == models.QuestionType.DATE:
        # Date - controlla se ci sono opzioni
        survey_options = db.query(models.SurveyOption).filter(
            models.SurveyOption.survey_id == survey_id
        ).all()
        
        if survey_options:
            # Con opzioni: mostra risultati come per SINGLE_CHOICE
            result_query = db.query(
                models.SurveyOption.id,
                models.SurveyOption.option_text,
                func.count(models.Vote.id).label('vote_count')
            ).outerjoin(models.Vote).filter(
                models.SurveyOption.survey_id == survey_id
            ).group_by(models.SurveyOption.id).all()
            
            total_votes = sum(r.vote_count for r in result_query)
            
            results = [
                schemas.SurveyResult(
                    option_id=r.id,
                    option_text=r.option_text,
                    vote_count=r.vote_count,
                    percentage=round((r.vote_count / total_votes * 100), 2) if total_votes > 0 else 0
                )
                for r in result_query
            ]
            
            total_responses = total_votes
        else:
            # Backward compatibility: date senza opzioni
            date_query = db.query(
                models.Vote.date_value,
                func.count(models.Vote.id).label('count')
            ).filter(
                models.Vote.survey_id == survey_id,
                models.Vote.date_value.isnot(None)
            ).group_by(models.Vote.date_value).order_by(func.count(models.Vote.id).desc()).first()
            
            if date_query:
                most_common_date = date_query[0]
                total_votes = db.query(models.Vote).filter(
                    models.Vote.survey_id == survey_id,
                    models.Vote.date_value.isnot(None)
                ).count()
                total_responses = total_votes
    
    # Recupera tutti i commenti dai gradimenti (i commenti ora sono in survey_likes)
    comments_from_likes = db.query(models.SurveyLike).filter(
        models.SurveyLike.survey_id == survey_id,
        models.SurveyLike.comment.isnot(None),
        models.SurveyLike.comment != ''
    ).order_by(models.SurveyLike.created_at.desc()).all()
    
    # Converti i commenti in formato OpenResponse per il frontend
    for like in comments_from_likes:
        open_responses.append(schemas.OpenResponse(
            id=like.id,
            survey_id=like.survey_id,
            voter_ip=like.user_ip,
            voter_session=like.user_session,
            response_text=like.comment,
            responded_at=like.created_at
        ))
    
    # Calcola statistiche gradimento
    like_stats = calculate_like_stats(survey_id, db)
    
    return schemas.SurveyResultsResponse(
        survey_id=survey_id,
        survey_title=survey.title,
        question_type=survey.question_type,
        total_votes=total_votes,
        total_responses=total_responses,
        results=results,
        numeric_stats=numeric_stats,
        value_distribution=value_distribution,
        rating_icon=survey.rating_icon if survey.question_type in [models.QuestionType.RATING, models.QuestionType.SCALE] else None,
        min_value=survey.min_value if survey.question_type in [models.QuestionType.RATING, models.QuestionType.SCALE] else None,
        max_value=survey.max_value if survey.question_type in [models.QuestionType.RATING, models.QuestionType.SCALE] else None,
        like_stats=like_stats,
        open_responses=open_responses,
        most_common_date=most_common_date
    )

@app.get("/surveys/{survey_id}/stats", response_model=schemas.SurveyStats)
def get_survey_stats(survey_id: int, db: Session = Depends(get_db)):
    """Ottieni statistiche dettagliate di un sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    total_votes = db.query(models.Vote).filter(models.Vote.survey_id == survey_id).count()
    total_participants = db.query(models.Vote.voter_session).filter(
        models.Vote.survey_id == survey_id
    ).distinct().count()
    
    last_vote = db.query(models.Vote.voted_at).filter(
        models.Vote.survey_id == survey_id
    ).order_by(models.Vote.voted_at.desc()).first()
    
    options_count = db.query(models.SurveyOption).filter(
        models.SurveyOption.survey_id == survey_id
    ).count()
    
    # Calcola statistiche gradimento
    like_stats = calculate_like_stats(survey_id, db)
    
    return schemas.SurveyStats(
        survey_id=survey.id,
        survey_title=survey.title,
        survey_description=survey.description,
        question_type=survey.question_type,
        created_at=survey.created_at,
        expires_at=survey.expires_at,
        is_active=survey.is_active,
        total_participants=total_participants,
        total_votes=total_votes,
        last_vote_at=last_vote[0] if last_vote else None,
        options_count=options_count,
        like_stats=like_stats,
        tags=survey.tags
    )

# ===== ENDPOINTS PER I GRADIMENTI =====

def calculate_like_stats(survey_id: int, db: Session) -> Optional[schemas.SurveyLikeStats]:
    """Calcola le statistiche dei gradimenti per un sondaggio"""
    likes = db.query(models.SurveyLike).filter(
        models.SurveyLike.survey_id == survey_id
    ).all()
    
    if not likes:
        return None
    
    ratings = [like.rating for like in likes]
    total_likes = len(ratings)
    average_rating = sum(ratings) / total_likes
    
    # Calcola la distribuzione (1-5)
    rating_counts = Counter(ratings)
    distribution = []
    for val in range(1, 6):
        distribution.append(schemas.ValueDistribution(
            value=float(val),
            count=rating_counts.get(val, 0)
        ))
    
    return schemas.SurveyLikeStats(
        average_rating=round(average_rating, 2),
        total_likes=total_likes,
        rating_distribution=distribution
    )

@app.post("/surveys/{survey_id}/like")
def like_survey(
    survey_id: int,
    like: schemas.SurveyLikeCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Valuta il gradimento di un sondaggio (1-5 pallini verdi)"""
    # Verifica sondaggio
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    # Ottieni session
    client_ip = request.client.host
    session_id = get_or_create_session(request)
    
    # Verifica se ha già valutato
    existing = db.query(models.SurveyLike).filter(
        models.SurveyLike.survey_id == survey_id,
        or_(
            models.SurveyLike.user_ip == client_ip,
            models.SurveyLike.user_session == session_id
        )
    ).first()
    
    if existing:
        # Aggiorna il gradimento esistente
        existing.rating = like.rating
        existing.comment = like.comment  # Aggiorna anche il commento
        db.commit()
        db.refresh(existing)
        return {"message": "Gradimento aggiornato con successo", "like": existing}
    else:
        # Crea nuovo gradimento
        db_like = models.SurveyLike(
            survey_id=survey_id,
            user_ip=client_ip,
            user_session=session_id,
            rating=like.rating,
            comment=like.comment  # Salva anche il commento
        )
        db.add(db_like)
        db.commit()
        db.refresh(db_like)
        return {"message": "Gradimento registrato con successo", "like": db_like}

@app.get("/surveys/{survey_id}/like", response_model=Optional[schemas.SurveyLike])
def get_user_like(
    survey_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Ottieni il gradimento dell'utente per un sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    client_ip = request.client.host
    session_id = get_or_create_session(request)
    
    existing = db.query(models.SurveyLike).filter(
        models.SurveyLike.survey_id == survey_id,
        or_(
            models.SurveyLike.user_ip == client_ip,
            models.SurveyLike.user_session == session_id
        )
    ).first()
    
    return existing

@app.get("/surveys/{survey_id}/like/stats", response_model=Optional[schemas.SurveyLikeStats])
def get_like_stats(survey_id: int, db: Session = Depends(get_db)):
    """Ottieni le statistiche dei gradimenti per un sondaggio"""
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    
    return calculate_like_stats(survey_id, db)

# ===== ENDPOINTS PER I SETTINGS =====
@app.get("/settings/{key}")
def get_setting(key: str, db: Session = Depends(get_db)):
    """Ottieni un setting specifico per chiave"""
    setting = db.query(models.Settings).filter(models.Settings.key == key).first()
    if not setting:
        # Ritorna valore di default se non esiste
        if key == "qr_code_url":
            return {"key": key, "value": "https://example.com"}
        raise HTTPException(status_code=404, detail="Setting non trovato")
    return {"key": setting.key, "value": setting.value}

@app.put("/settings/{key}")
def update_setting(key: str, update: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    """Aggiorna o crea un setting"""
    setting = db.query(models.Settings).filter(models.Settings.key == key).first()
    
    if setting:
        # Aggiorna esistente
        setting.value = update.value
    else:
        # Crea nuovo
        setting = models.Settings(key=key, value=update.value)
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
