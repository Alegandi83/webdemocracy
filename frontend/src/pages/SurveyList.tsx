import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Vote, BarChart2, TrendingUp, Trash2, Calendar, FileText, X, Star, CheckCircle, CheckSquare, MessageSquare, Hash, List as ListIcon, Filter, Lock } from 'lucide-react';
import { Survey, Tag, QuestionType } from '../types';
import { surveyApi } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';
import LikeRating from '../components/LikeRating';

const SurveyList: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtri
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  const [filterTag, setFilterTag] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [filterLikeRating, setFilterLikeRating] = useState<'all' | '1+' | '2+' | '3+' | '4+' | '5'>('all');

  useEffect(() => {
    loadSurveys();
    loadTags();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const surveysData = await surveyApi.getAllSurveys();
      setSurveys(surveysData);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei sondaggi');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await surveyApi.getTags();
      setAllTags(tagsData);
    } catch (err) {
      console.error('Errore caricamento tag:', err);
    }
  };

  const handleDeleteSurvey = async (surveyId: number, surveyTitle: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il sondaggio "${surveyTitle}"?\n\nQuesta azione non può essere annullata e eliminerà anche tutti i voti associati.`)) {
      return;
    }

    try {
      await surveyApi.deleteSurvey(surveyId);
      setSuccess(`Sondaggio "${surveyTitle}" eliminato con successo`);
      setError(null);
      setSurveys(prev => prev.filter(survey => survey.id !== surveyId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Errore nell'eliminazione del sondaggio: ${err.response?.data?.detail || 'Errore sconosciuto'}`);
      console.error('Errore eliminazione:', err);
    }
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterTag('all');
    setFilterStatus('all');
    setFilterLikeRating('all');
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return <CheckCircle size={16} />;
      case QuestionType.MULTIPLE_CHOICE:
        return <CheckSquare size={16} />;
      case QuestionType.RATING:
        return <Star size={16} />;
      case QuestionType.SCALE:
        return <BarChart2 size={16} />;
      case QuestionType.OPEN_TEXT:
        return <MessageSquare size={16} />;
      case QuestionType.DATE:
        return <Calendar size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return 'Scelta Singola';
      case QuestionType.MULTIPLE_CHOICE:
        return 'Scelta Multipla';
      case QuestionType.RATING:
        return 'Valutazione';
      case QuestionType.SCALE:
        return 'Scala';
      case QuestionType.OPEN_TEXT:
        return 'Risposta Aperta';
      case QuestionType.DATE:
        return 'Data';
      default:
        return type;
    }
  };

  const isExpired = (survey: Survey) => {
    if (!survey.expires_at) return false;
    return new Date(survey.expires_at) < new Date();
  };

  // Applica filtri
  const filteredSurveys = surveys.filter(survey => {
    if (filterType !== 'all' && survey.question_type !== filterType) {
      return false;
    }

    if (filterTag !== 'all') {
      const surveyTagIds = survey.tags?.map(t => t.id) || [];
      if (!surveyTagIds.includes(filterTag as number)) {
        return false;
      }
    }

    if (filterStatus === 'active' && (!survey.is_active || isExpired(survey))) {
      return false;
    }
    if (filterStatus === 'expired' && (!isExpired(survey) || survey.is_active)) {
      return false;
    }

    // Filtro gradimento
    if (filterLikeRating !== 'all') {
      // Scarta sondaggi senza gradimento quando il filtro è attivo
      if (!survey.average_like_rating) {
        return false;
      }
      const minRating = filterLikeRating === '5' ? 4.5 : parseInt(filterLikeRating);
      if (survey.average_like_rating < minRating) {
        return false;
      }
    }

    return true;
  });

  const activeFiltersCount = 
    (filterType !== 'all' ? 1 : 0) + 
    (filterTag !== 'all' ? 1 : 0) + 
    (filterStatus !== 'all' ? 1 : 0) +
    (filterLikeRating !== 'all' ? 1 : 0);

  // Pannello laterale con filtri
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
        <Filter size={20} style={{ color: '#6366f1' }} />
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#0f172a',
          flex: 1
        }}>
          Filtri
        </h3>
        {activeFiltersCount > 0 && (
          <span style={{
            background: '#ec4899',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {activeFiltersCount}
          </span>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <button 
          onClick={clearFilters}
          className="btn btn-secondary"
          style={{ 
            fontSize: '0.875rem', 
            padding: '0.5rem 1rem',
            width: '100%',
            marginBottom: '1.5rem'
          }}
        >
          <X size={16} />
          Rimuovi Tutti i Filtri
        </button>
      )}

      {/* Filtro Tipo */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8125rem', 
          fontWeight: '600',
          color: '#475569',
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Tipologia
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="form-input"
          style={{
            margin: 0,
            width: '100%',
            padding: '0.625rem 0.875rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tutti i Tipi</option>
          {Object.values(QuestionType).map(type => (
            <option key={type} value={type}>
              {getQuestionTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro Tag */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8125rem', 
            fontWeight: '600',
            color: '#475569',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Tag
          </label>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="form-input"
            style={{
              margin: 0,
              width: '100%',
              padding: '0.625rem 0.875rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tutti i Tag</option>
            {allTags.map(tag => (
              <option key={tag.id} value={tag.id}>
                🏷️ {tag.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filtro Stato */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8125rem', 
          fontWeight: '600',
          color: '#475569',
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Stato
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { value: 'all', label: 'Tutti', icon: '📋' },
            { value: 'active', label: 'Attivi', icon: '✅' },
            { value: 'expired', label: 'Conclusi', icon: '🔒' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value as any)}
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: '6px',
                border: filterStatus === option.value ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: filterStatus === option.value ? '#6366f1' : 'white',
                color: filterStatus === option.value ? 'white' : '#475569',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro Gradimento */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8125rem', 
          fontWeight: '600',
          color: '#475569',
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Gradimento Minimo
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { value: 'all', label: 'Tutti i Gradimenti', dots: 0 },
            { value: '1+', label: '1+', dots: 1 },
            { value: '2+', label: '2+', dots: 2 },
            { value: '3+', label: '3+', dots: 3 },
            { value: '4+', label: '4+', dots: 4 },
            { value: '5', label: '5', dots: 5 }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilterLikeRating(option.value as any)}
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: '6px',
                border: filterLikeRating === option.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: filterLikeRating === option.value ? '#ecfdf5' : 'white',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {option.dots > 0 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {Array.from({ length: option.dots }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid #10b981'
                      }}
                    />
                  ))}
                </div>
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Caricamento sondaggi...</div>;
  }

  // Calcola le statistiche dei sondaggi filtrati
  const totalFilteredSurveys = filteredSurveys.length;
  const totalFilteredParticipations = filteredSurveys.reduce(
    (sum, survey) => sum + (survey.total_votes || 0), 
    0
  );

  return (
    <SidebarLayout sidebar={sidebar}>
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0
          }}>
            Sondaggi Disponibili
          </h1>
          
          {/* Indicatori statistici */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0'
            }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#6366f1',
                lineHeight: '1'
              }}>
                {totalFilteredSurveys}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '0.25rem'
              }}>
                {totalFilteredSurveys === 1 ? 'Sondaggio' : 'Sondaggi'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0'
            }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#10b981',
                lineHeight: '1'
              }}>
                {totalFilteredParticipations}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#15803d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '0.25rem'
              }}>
                {totalFilteredParticipations === 1 ? 'Partecipazione' : 'Partecipazioni'}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {filteredSurveys.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <FileText size={48} style={{
              margin: '0 auto 1.5rem',
              color: '#94a3b8',
              opacity: 0.6
            }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '600' }}>
              {surveys.length === 0 ? 'Nessun sondaggio disponibile' : 'Nessun sondaggio corrisponde ai filtri'}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: '400' }}>
              {surveys.length === 0 
                ? 'Crea il tuo primo sondaggio per iniziare a raccogliere feedback!'
                : 'Prova a modificare i filtri per vedere più sondaggi.'
              }
            </p>
            {surveys.length === 0 ? (
              <Link to="/create" className="btn btn-primary">
                <PlusCircle size={20} />
                Crea Sondaggio
              </Link>
            ) : (
              <button onClick={clearFilters} className="btn btn-secondary">
                <X size={18} />
                Rimuovi Filtri
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredSurveys.map((survey) => {
              const expired = isExpired(survey);
              
              return (
                <div key={survey.id} className="card">
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                      <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
                        {survey.title}
                      </h2>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {survey.average_like_rating && survey.average_like_rating > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.5rem',
                            background: '#f0fdf4',
                            borderRadius: '4px',
                            border: '1px solid #86efac',
                            fontSize: '0.75rem'
                          }}>
                            <LikeRating value={Math.round(survey.average_like_rating)} readonly size={12} />
                            <span style={{ color: '#15803d', fontWeight: '500' }}>
                              {survey.average_like_rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.8125rem',
                          fontWeight: '500',
                          color: '#475569',
                          whiteSpace: 'nowrap'
                        }}>
                          {getQuestionTypeIcon(survey.question_type)}
                          <span>{getQuestionTypeLabel(survey.question_type)}</span>
                        </div>
                      </div>
                    </div>

                    {survey.description && (
                      <p className="card-description">{survey.description}</p>
                    )}

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      alignItems: 'center',
                      marginTop: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: '#94a3b8',
                        fontSize: '0.8125rem'
                      }}>
                        <Calendar size={14} />
                        <span>
                          {new Date(survey.created_at).toLocaleDateString('it-IT', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {survey.tags && survey.tags.length > 0 && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          {survey.tags.map(tag => (
                            <span
                              key={tag.id}
                              style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: '4px',
                                background: tag.color,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </>
                      )}

                      {expired && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{
                            padding: '0.25rem 0.625rem',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Concluso
                          </span>
                        </>
                      )}

                      {!expired && survey.expires_at && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{
                            padding: '0.25rem 0.625rem',
                            borderRadius: '4px',
                            background: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Scade il {new Date(survey.expires_at).toLocaleDateString('it-IT')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    {expired ? (
                      <button
                        disabled
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1.25rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#94a3b8',
                          fontSize: '0.9375rem',
                          fontWeight: '500',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                      >
                        <Lock size={18} />
                        Concluso
                      </button>
                    ) : (
                      <Link to={`/survey/${survey.id}`} className="btn btn-primary">
                        <Vote size={18} />
                        Partecipa
                      </Link>
                    )}
                    <Link to={`/survey/${survey.id}/results`} className="btn btn-secondary">
                      <BarChart2 size={18} />
                      Vedi Risultati
                    </Link>
                    <Link to={`/survey/${survey.id}/stats`} className="btn btn-stats">
                      <TrendingUp size={18} />
                      Statistiche
                    </Link>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                      className="btn btn-danger"
                    >
                      <Trash2 size={18} />
                      Elimina
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default SurveyList;
