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

# ===== ENDPOINTS PER I TAG =====

@app.get("/tags", response_model=List[schemas.Tag])
def get_tags(db: Session = Depends(get_db)):
    """Ottieni tutti i tag disponibili"""
    return db.query(models.Tag).all()

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
def create_survey(survey: schemas.SurveyCreate, db: Session = Depends(get_db)):
    """Crea un nuovo sondaggio"""
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
