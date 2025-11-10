import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Vote, BarChart2, CheckCircle2, Calendar, MessageSquare, PlusCircle, ThumbsUp } from 'lucide-react';
import { Survey, QuestionType, VoteCreate, SurveyLike } from '../types';
import { surveyApi } from '../services/api';
import RatingInput from '../components/RatingInput';
import LikeRating from '../components/LikeRating';
import SidebarLayout from '../components/SidebarLayout';

const SurveyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  
  // Stati per diversi tipi di voto
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState<string>('');
  const [dateValue, setDateValue] = useState<string>('');
  const [textValue, setTextValue] = useState<string>('');
  const [customOptionText, setCustomOptionText] = useState<string>('');
  const [showCustomOption, setShowCustomOption] = useState(false);
  const [comment, setComment] = useState<string>('');
  
  // Stati per voti multipli per opzione (nuova funzionalità)
  const [optionVotes, setOptionVotes] = useState<Map<number, number>>(new Map());
  const [optionResponses, setOptionResponses] = useState<Map<number, string>>(new Map());
  
  // Stati per votare l'opzione personalizzata contestualmente
  const [customOptionVote, setCustomOptionVote] = useState<number | null>(null);
  const [customOptionResponse, setCustomOptionResponse] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Stati per il gradimento
  const [userLike, setUserLike] = useState<SurveyLike | null>(null);
  const [likeRating, setLikeRating] = useState<number>(0);
  const [likeSuccess, setLikeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSurvey(parseInt(id));
    }
  }, [id]);

  const loadSurvey = async (surveyId: number) => {
    try {
      setLoading(true);
      const surveyData = await surveyApi.getSurvey(surveyId);
      setSurvey(surveyData);
      
      // Carica il gradimento e il commento dell'utente se esistono
      const existingLike = await surveyApi.getUserLike(surveyId);
      if (existingLike) {
        setUserLike(existingLike);
        setLikeRating(existingLike.rating);
        if (existingLike.comment) {
          setComment(existingLike.comment);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento del sondaggio');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (optionId: number) => {
    if (!survey) return;

    if (survey.question_type === QuestionType.SINGLE_CHOICE || survey.question_type === QuestionType.DATE) {
      setSelectedOptions([optionId]);
      // Quando si seleziona una data dalle opzioni, cancella la data personalizzata
      if (survey.question_type === QuestionType.DATE) {
        setDateValue('');
      }
    } else if (survey.question_type === QuestionType.MULTIPLE_CHOICE) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const handleVote = async () => {
    if (!survey) return;

    try {
      setVoting(true);
      setError(null);

      const voteData: VoteCreate = {};

      // Costruisci il voto in base al tipo
      if (survey.question_type === QuestionType.SINGLE_CHOICE || 
          survey.question_type === QuestionType.MULTIPLE_CHOICE) {
        
        // Aggiungi custom option se presente
        if (customOptionText.trim()) {
          voteData.custom_option_text = customOptionText.trim();
        }
        
        // Aggiungi opzioni selezionate se presenti
        if (selectedOptions.length > 0) {
          voteData.option_ids = selectedOptions;
        }
        
        // Verifica che almeno una delle due sia presente
        if (!voteData.custom_option_text && (!voteData.option_ids || voteData.option_ids.length === 0)) {
          setError('Seleziona almeno un\'opzione o inserisci una nuova');
          setVoting(false);
          return;
        }
      } else if (survey.question_type === QuestionType.RATING || 
                 survey.question_type === QuestionType.SCALE) {
        
        // Controlla se ci sono opzioni
        if (survey.options && survey.options.length > 0) {
          // Nuova modalità: voto per ogni opzione
          const votes: { option_id: number; numeric_value?: number }[] = [];
          
          for (const option of survey.options) {
            const value = optionVotes.get(option.id);
            if (value !== undefined) {
              votes.push({
                option_id: option.id,
                numeric_value: value
              });
            }
          }
          
          // Aggiungi custom option se presente con il suo voto
          if (customOptionText.trim()) {
            if (!customOptionVote) {
              setError('Devi valutare la nuova opzione proposta');
              setVoting(false);
              return;
            }
            voteData.custom_option_text = customOptionText.trim();
            // Aggiungi il voto per l'opzione personalizzata come valore numerico generico
            voteData.numeric_value = customOptionVote;
          }
          
          if (votes.length === 0 && !voteData.custom_option_text) {
            setError('Inserisci almeno una valutazione o aggiungi una nuova opzione');
            setVoting(false);
            return;
          }
          
          if (votes.length > 0) {
            voteData.option_votes = votes;
          }
        } else {
          // Backward compatibility: voto singolo
          if (survey.question_type === QuestionType.RATING) {
            if (!ratingValue) {
              setError('Seleziona una valutazione');
              setVoting(false);
              return;
            }
            voteData.numeric_value = ratingValue;
          } else {
            if (!numericValue) {
              setError('Inserisci un valore numerico');
              setVoting(false);
              return;
            }
            voteData.numeric_value = parseFloat(numericValue);
          }
        }
      } else if (survey.question_type === QuestionType.DATE) {
        // Controlla se ci sono opzioni
        if (survey.options && survey.options.length > 0) {
          // Nuova modalità: selezione tra date proposte o data personalizzata
          if (dateValue.trim()) {
            // Data personalizzata
            voteData.date_value = dateValue;
          } else if (selectedOptions.length > 0) {
            // Data selezionata dalle opzioni
            voteData.option_ids = selectedOptions;
          } else {
            setError('Seleziona una data disponibile o proponi una nuova data');
            setVoting(false);
            return;
          }
        } else {
          // Backward compatibility: selezione libera
          if (!dateValue) {
            setError('Seleziona una data');
            setVoting(false);
            return;
          }
          voteData.date_value = dateValue;
        }
      } else if (survey.question_type === QuestionType.OPEN_TEXT) {
        // Controlla se ci sono opzioni
        if (survey.options && survey.options.length > 0) {
          // Nuova modalità: risposta per ogni opzione
          const responses: { option_id: number; response_text: string }[] = [];
          
          for (const option of survey.options) {
            const response = optionResponses.get(option.id);
            if (response && response.trim()) {
              responses.push({
                option_id: option.id,
                response_text: response.trim()
              });
            }
          }
          
          // Aggiungi custom option se presente con la sua risposta
          if (customOptionText.trim()) {
            if (!customOptionResponse.trim()) {
              setError('Devi inserire una risposta per il nuovo campo proposto');
              setVoting(false);
              return;
            }
            voteData.custom_option_text = customOptionText.trim();
            // Aggiungi la risposta per l'opzione personalizzata come commento generico
            voteData.comment = customOptionResponse.trim();
          }
          
          if (responses.length === 0 && !voteData.custom_option_text) {
            setError('Inserisci almeno una risposta o aggiungi un nuovo campo');
            setVoting(false);
            return;
          }
          
          if (responses.length > 0) {
            voteData.option_responses = responses;
          }
        } else {
          // Backward compatibility: risposta singola
          if (!textValue.trim()) {
            setError('Inserisci una risposta');
            setVoting(false);
            return;
          }
          voteData.comment = textValue.trim();
        }
      }
      
      // Aggiungi gradimento e commento sul sondaggio se presenti
      if (likeRating > 0) {
        voteData.like_rating = likeRating;
      }
      if (comment && comment.trim()) {
        voteData.survey_comment = comment.trim();
      }
      
      await surveyApi.voteSurvey(survey.id, voteData);
      setSuccess('Voto registrato con successo!');
      
      setTimeout(() => {
        navigate(`/survey/${survey.id}/results`);
      }, 2000);
      
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Errore nella registrazione del voto');
      } else {
        setError('Errore nella registrazione del voto');
      }
      console.error('Errore:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleLikeChange = (rating: number) => {
    // Aggiorna solo lo stato locale, il gradimento verrà salvato insieme al voto
    setLikeRating(rating);
    setLikeSuccess(null);
  };
  
  // Aggiorna solo lo stato locale del commento
  const handleCommentChange = (newComment: string) => {
    setComment(newComment);
  };

  if (loading) {
    return <div className="loading">Caricamento sondaggio...</div>;
  }

  if (error && !survey) {
    return (
      <div className="error">
        {error}
        <button onClick={() => navigate('/surveys')} className="btn btn-primary" style={{ marginLeft: '1rem' }}>
          Torna alla Lista
        </button>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  // Pannello laterale con gradimento
  const sidebar = (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <ThumbsUp size={20} style={{ color: '#10b981' }} />
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#0f172a',
          flex: 1
        }}>
          Gradimento
        </h3>
      </div>

      <div style={{
        background: '#f8fafc',
        borderRadius: '8px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          marginBottom: '1rem',
          lineHeight: 1.6
        }}>
          Quanto ti è piaciuto questo sondaggio?
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem 0'
        }}>
          <LikeRating
            value={likeRating}
            onChange={handleLikeChange}
            size={28}
          />
        </div>

        {likeRating > 0 && (
          <p style={{
            marginTop: '1rem',
            fontSize: '0.8125rem',
            color: '#10b981',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            ✓ Hai selezionato {likeRating} pallini verdi
          </p>
        )}
      </div>

      {/* Sezione Commento */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <MessageSquare size={20} style={{ color: '#6366f1' }} />
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#0f172a'
          }}>
            Commento
          </h3>
        </div>

        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#64748b',
            marginBottom: '0.75rem'
          }}>
            Aggiungi un commento al sondaggio {survey.require_comment && <span style={{ color: '#6366f1' }}>(suggerito)</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            className="form-textarea"
            placeholder="Condividi la tua opinione su questo sondaggio..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            marginTop: '0.75rem',
            fontSize: '0.75rem',
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            💡 Gradimento e commento verranno registrati insieme alla conferma del voto
          </p>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fbbf24'
      }}>
        <p style={{
          fontSize: '0.8125rem',
          color: '#92400e',
          margin: 0,
          lineHeight: 1.5
        }}>
          💡 Il tuo gradimento aiuta a migliorare i sondaggi futuri!
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/surveys')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Torna alla Lista
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="card-title">{survey.title}</h1>
          
          {survey.description && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              marginTop: '0.75rem',
              padding: '0.875rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <MessageSquare size={16} style={{
                color: '#6366f1',
                flexShrink: 0,
                marginTop: '0.125rem'
              }} />
              <p style={{
                color: '#475569',
                margin: 0,
                lineHeight: 1.5,
                fontSize: '0.9375rem',
                fontWeight: '400'
              }}>
                {survey.description}
              </p>
            </div>
          )}

          {survey.tags && survey.tags.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '0.75rem'
            }}>
              {survey.tags.map(tag => (
                <span
                  key={tag.id}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    background: tag.color,
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginTop: '0.75rem',
            color: '#94a3b8',
            fontSize: '0.8125rem'
          }}>
            <Calendar size={14} />
            <span>
              Creato il: {new Date(survey.created_at).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {survey.expires_at && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              color: '#92400e',
              fontSize: '0.8125rem',
              fontWeight: '500'
            }}>
              ⏰ Scadenza: {new Date(survey.expires_at).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>

        {/* Single/Multiple Choice */}
        {(survey.question_type === QuestionType.SINGLE_CHOICE || 
          survey.question_type === QuestionType.MULTIPLE_CHOICE) && (
          <div>
            <h3 style={{
              marginBottom: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <Vote size={18} style={{ color: '#6366f1' }} />
              {survey.question_type === QuestionType.MULTIPLE_CHOICE 
                ? 'Seleziona una o più risposte:' 
                : 'Seleziona la tua risposta:'}
            </h3>

            {survey.options.map((option, index) => (
              <div
                key={option.id}
                className={`option-item ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                onClick={() => toggleOption(option.id)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <input
                  type={survey.question_type === QuestionType.MULTIPLE_CHOICE ? 'checkbox' : 'radio'}
                  className="option-radio"
                  name="survey-option"
                  value={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                />
                <span className="option-text">{option.option_text}</span>
                {selectedOptions.includes(option.id) && (
                  <CheckCircle2
                    size={20}
                    style={{
                      color: '#6366f1',
                      marginLeft: 'auto'
                    }}
                  />
                )}
              </div>
            ))}

            {/* Custom Option */}
            {survey.allow_custom_options && (
              <div style={{ marginTop: '1rem' }}>
                {!showCustomOption ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomOption(true)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <PlusCircle size={18} />
                    Aggiungi una Nuova Opzione
                  </button>
                ) : (
                  <div style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '2px dashed #6366f1'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '0.5rem'
                    }}>
                      La tua opzione personalizzata:
                    </label>
                    <input
                      type="text"
                      value={customOptionText}
                      onChange={(e) => setCustomOptionText(e.target.value)}
                      placeholder="Inserisci la tua opzione..."
                      className="form-input"
                      style={{ margin: 0, marginBottom: '0.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomOption(false);
                        setCustomOptionText('');
                      }}
                      style={{
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {survey.question_type === QuestionType.RATING && (
          <div>
            {survey.options && survey.options.length > 0 ? (
              // Nuova modalità: voto per ogni opzione
              <div>
                <h3 style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Valuta ogni opzione da {survey.min_value} a {survey.max_value}:
                </h3>
                {survey.options.map((option) => (
                  <div key={option.id} style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#334155'
                    }}>
                      {option.option_text}
                    </label>
                    <RatingInput
                      value={optionVotes.get(option.id) || null}
                      onChange={(value) => {
                        const newVotes = new Map(optionVotes);
                        if (value) {
                          newVotes.set(option.id, value);
                        } else {
                          newVotes.delete(option.id);
                        }
                        setOptionVotes(newVotes);
                      }}
                      max={survey.max_value || 5}
                      icon={survey.rating_icon}
                    />
                  </div>
                ))}

                {/* Custom Option for Rating */}
                {survey.allow_custom_options && (
                  <div style={{ marginTop: '1rem' }}>
                    {!showCustomOption ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomOption(true);
                          // Inizializza il voto al valore minimo
                          setCustomOptionVote(survey.min_value || 1);
                        }}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        <PlusCircle size={18} />
                        Aggiungi un'Opzione da Valutare
                      </button>
                    ) : (
                      <div style={{
                        padding: '1.5rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '2px dashed #6366f1'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.5rem'
                        }}>
                          Nuova opzione da valutare:
                        </label>
                        <input
                          type="text"
                          value={customOptionText}
                          onChange={(e) => setCustomOptionText(e.target.value)}
                          placeholder="Inserisci l'opzione..."
                          className="form-input"
                          style={{ margin: 0, marginBottom: '1rem' }}
                        />
                        
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.75rem'
                        }}>
                          Valuta questa opzione da {survey.min_value} a {survey.max_value}:
                        </label>
                        <RatingInput
                          value={customOptionVote}
                          onChange={setCustomOptionVote}
                          max={survey.max_value || 5}
                          icon={survey.rating_icon}
                        />
                        
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomOption(false);
                              setCustomOptionText('');
                              setCustomOptionVote(null);
                            }}
                            style={{
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Backward compatibility: voto singolo
              <div>
                <h3 style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Valuta da {survey.min_value} a {survey.max_value}:
                </h3>
                <RatingInput
                  value={ratingValue}
                  onChange={setRatingValue}
                  max={survey.max_value || 5}
                  icon={survey.rating_icon}
                />
              </div>
            )}
          </div>
        )}

        {/* Scale */}
        {survey.question_type === QuestionType.SCALE && (
          <div>
            {survey.options && survey.options.length > 0 ? (
              // Nuova modalità: voto per ogni opzione
              <div>
                <h3 style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Valuta ogni opzione da {survey.min_value} a {survey.max_value}:
                </h3>
                {survey.options.map((option) => (
                  <div key={option.id} style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#334155'
                    }}>
                      {option.option_text}
                    </label>
                    {survey.scale_min_label && survey.scale_max_label && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        <span>{survey.scale_min_label}</span>
                        <span>{survey.scale_max_label}</span>
                      </div>
                    )}
                    <input
                      type="range"
                      min={survey.min_value}
                      max={survey.max_value}
                      value={optionVotes.get(option.id) || survey.min_value}
                      onChange={(e) => {
                        const newVotes = new Map(optionVotes);
                        newVotes.set(option.id, parseFloat(e.target.value));
                        setOptionVotes(newVotes);
                      }}
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        appearance: 'none',
                        background: '#e2e8f0',
                        outline: 'none'
                      }}
                    />
                    <div style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#6366f1'
                    }}>
                      {optionVotes.get(option.id) || survey.min_value}
                    </div>
                  </div>
                ))}

                {/* Custom Option for Scale */}
                {survey.allow_custom_options && (
                  <div style={{ marginTop: '1rem' }}>
                    {!showCustomOption ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomOption(true);
                          // Inizializza lo slider al valore minimo
                          setCustomOptionVote(survey.min_value || 1);
                        }}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        <PlusCircle size={18} />
                        Aggiungi un'Opzione da Valutare
                      </button>
                    ) : (
                      <div style={{
                        padding: '1.5rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '2px dashed #6366f1'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.5rem'
                        }}>
                          Nuova opzione da valutare:
                        </label>
                        <input
                          type="text"
                          value={customOptionText}
                          onChange={(e) => setCustomOptionText(e.target.value)}
                          placeholder="Inserisci l'opzione..."
                          className="form-input"
                          style={{ margin: 0, marginBottom: '1rem' }}
                        />
                        
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.75rem'
                        }}>
                          Valuta questa opzione da {survey.min_value} a {survey.max_value}:
                        </label>
                        {survey.scale_min_label && survey.scale_max_label && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                            fontSize: '0.875rem',
                            color: '#64748b'
                          }}>
                            <span>{survey.scale_min_label}</span>
                            <span>{survey.scale_max_label}</span>
                          </div>
                        )}
                        <input
                          type="range"
                          min={survey.min_value}
                          max={survey.max_value}
                          value={customOptionVote || survey.min_value}
                          onChange={(e) => setCustomOptionVote(parseFloat(e.target.value))}
                          style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            appearance: 'none',
                            background: '#e2e8f0',
                            outline: 'none'
                          }}
                        />
                        <div style={{
                          textAlign: 'center',
                          marginTop: '1rem',
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#6366f1'
                        }}>
                          {customOptionVote || survey.min_value}
                        </div>
                        
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomOption(false);
                              setCustomOptionText('');
                              setCustomOptionVote(null);
                            }}
                            style={{
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Backward compatibility: voto singolo
              <div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Seleziona un valore da {survey.min_value} a {survey.max_value}:
                </h3>
                {survey.scale_min_label && survey.scale_max_label && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    <span>{survey.scale_min_label}</span>
                    <span>{survey.scale_max_label}</span>
                  </div>
                )}
                <input
                  type="range"
                  min={survey.min_value}
                  max={survey.max_value}
                  value={numericValue || survey.min_value}
                  onChange={(e) => setNumericValue(e.target.value)}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    background: '#e2e8f0',
                    outline: 'none'
                  }}
                />
                <div style={{
                  textAlign: 'center',
                  marginTop: '1rem',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#6366f1'
                }}>
                  {numericValue || survey.min_value}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date */}
        {survey.question_type === QuestionType.DATE && (
          <div>
            {survey.options && survey.options.length > 0 ? (
              // Nuova modalità: selezione tra date proposte
              <div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Calendar size={18} style={{ color: '#6366f1' }} />
                  Seleziona una data disponibile:
                </h3>

                {survey.options.map((option, index) => {
                  const dateStr = option.option_text;
                  const isSelected = selectedOptions.includes(option.id);
                  
                  // Formatta la data in italiano
                  let formattedDate = dateStr;
                  try {
                    let date: Date | null = null;
                    
                    // Prova prima il formato ISO (yyyy-mm-dd)
                    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      date = new Date(dateStr + 'T00:00:00');
                    }
                    // Poi prova il formato italiano (dd/mm/yyyy) per retrocompatibilità
                    else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const [day, month, year] = dateStr.split('/');
                      date = new Date(`${year}-${month}-${day}T00:00:00`);
                    }
                    
                    if (date && !isNaN(date.getTime())) {
                      formattedDate = date.toLocaleDateString('it-IT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    }
                  } catch (e) {
                    // Se non è una data valida, mostra il testo così com'è
                  }

                  return (
                    <div
                      key={option.id}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleOption(option.id)}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <input
                        type="radio"
                        className="option-radio"
                        name="survey-date-option"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => toggleOption(option.id)}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="option-text">{formattedDate}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          marginTop: '0.25rem'
                        }}>
                          {dateStr}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2
                          size={20}
                          style={{
                            color: '#6366f1',
                            marginLeft: 'auto'
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Custom Date Option */}
                {survey.allow_custom_options && (
                  <div style={{ marginTop: '1rem' }}>
                    {!showCustomOption ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomOption(true)}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        <PlusCircle size={18} />
                        Proponi una Nuova Data
                      </button>
                    ) : (
                      <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '2px dashed #6366f1'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.5rem'
                        }}>
                          Proponi una data alternativa:
                        </label>
                        <input
                          type="date"
                          value={dateValue}
                          onChange={(e) => {
                            setDateValue(e.target.value);
                            // Quando si inserisce una data personalizzata, deseleziona le opzioni
                            setSelectedOptions([]);
                          }}
                          className="form-input"
                          style={{ margin: 0, marginBottom: '0.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomOption(false);
                            setDateValue('');
                          }}
                          style={{
                            fontSize: '0.8125rem',
                            color: '#64748b',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Annulla
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Backward compatibility: selezione libera
              <div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Seleziona una data:
                </h3>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '1.125rem' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Open Text */}
        {survey.question_type === QuestionType.OPEN_TEXT && (
          <div>
            {survey.options && survey.options.length > 0 ? (
              // Nuova modalità: risposta per ogni opzione
              <div>
                <h3 style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Commenta su ogni opzione:
                </h3>
                {survey.options.map((option) => (
                  <div key={option.id} style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#334155'
                    }}>
                      {option.option_text}
                    </label>
                    <textarea
                      value={optionResponses.get(option.id) || ''}
                      onChange={(e) => {
                        const newResponses = new Map(optionResponses);
                        const value = e.target.value;
                        if (value) {
                          newResponses.set(option.id, value);
                        } else {
                          newResponses.delete(option.id);
                        }
                        setOptionResponses(newResponses);
                      }}
                      className="form-textarea"
                      placeholder="Inserisci un commento..."
                      rows={4}
                    />
                  </div>
                ))}

                {/* Custom Option for Open Text */}
                {survey.allow_custom_options && (
                  <div style={{ marginTop: '1rem' }}>
                    {!showCustomOption ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomOption(true)}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        <PlusCircle size={18} />
                        Aggiungi un Nuovo Campo di Risposta
                      </button>
                    ) : (
                      <div style={{
                        padding: '1.5rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '2px dashed #6366f1'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.5rem'
                        }}>
                          Nuovo campo di risposta:
                        </label>
                        <input
                          type="text"
                          value={customOptionText}
                          onChange={(e) => setCustomOptionText(e.target.value)}
                          placeholder="Inserisci l'etichetta del campo..."
                          className="form-input"
                          style={{ margin: 0, marginBottom: '1rem' }}
                        />
                        
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#475569',
                          marginBottom: '0.5rem'
                        }}>
                          La tua risposta:
                        </label>
                        <textarea
                          value={customOptionResponse}
                          onChange={(e) => setCustomOptionResponse(e.target.value)}
                          className="form-textarea"
                          placeholder="Inserisci la tua risposta..."
                          rows={4}
                          style={{ margin: 0 }}
                        />
                        
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomOption(false);
                              setCustomOptionText('');
                              setCustomOptionResponse('');
                            }}
                            style={{
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Backward compatibility: risposta singola
              <div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Scrivi la tua risposta:
                </h3>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="form-textarea"
                  placeholder="Inserisci qui la tua risposta..."
                  rows={6}
                />
              </div>
            )}
          </div>
        )}

        {/* Pulsanti */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={handleVote}
            className="btn btn-primary"
            disabled={voting}
            style={{ flex: 1 }}
          >
            <Vote size={18} />
            {voting ? 'Votando...' : 'Conferma Voto'}
          </button>

          <button
            onClick={() => navigate(`/survey/${survey.id}/results`)}
            className="btn btn-secondary"
          >
            <BarChart2 size={18} />
            Vedi Risultati
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout 
      sidebar={sidebar} 
      sidebarPosition="right"
      mobileToggleLabel="Esprimi Gradimento"
    >
      {mainContent}
    </SidebarLayout>
  );
};

export default SurveyDetail;
