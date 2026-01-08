import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Vote, BarChart2, Calendar, Users, CheckSquare, Clock, TrendingUp, MessageSquare, Star, List, CheckCircle, Lock, Unlock, Trash2, User, XCircle, Link as LinkIcon, Image as ImageIcon, Newspaper, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SurveyStats, QuestionType, Survey, ClosureType } from '../types';
import { surveyApi } from '../services/api';

interface TimelineData {
  timestamp: string;
  votes: number;
  period_votes: number;
}

const SurveyStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [granularity, setGranularity] = useState<'hourly' | 'daily'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadStats(parseInt(id));
      loadSurvey(parseInt(id));
      loadTimeline(parseInt(id));
    }
  }, [id]);

  const loadStats = async (surveyId: number) => {
    try {
      setLoading(true);
      const statsData = await surveyApi.getSurveyStats(surveyId);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle statistiche del sondaggio');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSurvey = async (surveyId: number) => {
    try {
      const surveyData = await surveyApi.getSurvey(surveyId);
      setSurvey(surveyData);
    } catch (err) {
      console.error('Errore caricamento survey:', err);
    }
  };

  const loadTimeline = async (surveyId: number) => {
    try {
      const response = await fetch(`/surveys/${surveyId}/votes-timeline`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline || []);
        setGranularity(data.granularity || 'daily');
      }
    } catch (err) {
      console.error('Errore caricamento timeline:', err);
    }
  };

  const isExpired = (survey: Survey) => {
    if (!survey.expires_at) return false;
    return new Date(survey.expires_at) < new Date();
  };

  const isClosed = (survey: Survey) => {
    // Un sondaggio è chiuso se:
    // 1. È scaduto (expires_at nel passato)
    // 2. È stato chiuso manualmente (is_active = false)
    return isExpired(survey) || !survey.is_active;
  };

  const handleToggleSurveyStatus = async () => {
    if (!survey) return;
    
    try {
      setToggling(true);
      const response = await fetch(`/api/surveys/${survey.id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ricarica sia il survey completo che le statistiche
        await loadSurvey(survey.id);
        await loadStats(survey.id);
        setSuccess(data.is_active ? 'Sondaggio riaperto!' : 'Sondaggio chiuso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Errore nel cambio stato del sondaggio');
      }
    } catch (err) {
      setError('Errore nel cambio stato del sondaggio');
      console.error('Errore:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteSurvey = async () => {
    if (!survey) return;
    
    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare il sondaggio "${survey.title}"? Questa azione è irreversibile.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/surveys/${survey.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccess('Sondaggio eliminato con successo!');
        setTimeout(() => {
          navigate('/surveys');
        }, 1500);
      } else {
        setError('Errore nell\'eliminazione del sondaggio');
      }
    } catch (err) {
      setError('Errore nell\'eliminazione del sondaggio');
      console.error('Errore:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeSinceCreation = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return '1 giorno fa';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    return `${Math.floor(diffDays / 30)} mesi fa`;
  };

  const getQuestionTypeInfo = (type: string) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return { label: 'Scelta Singola', icon: <CheckCircle size={18} />, color: '#6366f1', description: 'Una sola risposta' };
      case QuestionType.MULTIPLE_CHOICE:
        return { label: 'Scelta Multipla', icon: <CheckSquare size={18} />, color: '#8b5cf6', description: 'Più risposte possibili' };
      case QuestionType.RATING:
        return { label: 'Valutazione', icon: <Star size={18} />, color: '#fbbf24', description: 'Rating con stelle/cuori' };
      case QuestionType.SCALE:
        return { label: 'Scala Numerica', icon: <BarChart2 size={18} />, color: '#10b981', description: 'Valore da min a max' };
      case QuestionType.OPEN_TEXT:
        return { label: 'Risposta Aperta', icon: <MessageSquare size={18} />, color: '#ec4899', description: 'Testo libero' };
      case QuestionType.DATE:
        return { label: 'Data', icon: <Calendar size={18} />, color: '#f59e0b', description: 'Selezione data' };
      default:
        return { label: 'Sconosciuto', icon: <TrendingUp size={18} />, color: '#64748b', description: '' };
    }
  };

  const getResourceTypeIcon = (resourceType?: string) => {
    switch (resourceType) {
      case 'url':
        return <LinkIcon size={14} />;
      case 'image':
        return <ImageIcon size={14} />;
      case 'news':
        return <Newspaper size={14} />;
      case 'none':
      default:
        return null;
    }
  };

  const getResourceTypeTitle = (resourceType?: string) => {
    switch (resourceType) {
      case 'url':
        return 'Risorsa: URL';
      case 'image':
        return 'Risorsa: Immagine';
      case 'news':
        return 'Risorsa: Notizia';
      case 'none':
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Caricamento statistiche...</div>;
  }

  if (error || !stats) {
    return (
      <div className="error">
        {error || 'Statistiche non trovate'}
        <button onClick={() => navigate('/surveys')} className="btn btn-primary" style={{ marginLeft: '1rem' }}>
          Torna alla Lista
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Messaggi di successo/errore */}
      {success && (
        <div className="success" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => navigate('/surveys')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Torna alla Lista
        </button>
        {survey && isClosed(survey) ? (
          <button 
            className="btn btn-secondary"
            disabled
            style={{
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          >
            <Lock size={18} />
            Concluso
          </button>
        ) : (
          <Link to={`/survey/${stats.survey_id}`} className="btn btn-primary">
            <Vote size={18} />
            Partecipa
          </Link>
        )}
        {(survey?.show_results_on_close || stats.show_results_on_close) && survey && !isClosed(survey) ? (
          <button
            disabled
            className="btn btn-secondary"
            style={{
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            <Lock size={18} />
            Risultati alla chiusura
          </button>
        ) : (
          <Link to={`/survey/${stats.survey_id}/results`} className="btn btn-secondary">
            <BarChart2 size={18} />
            Risultati
          </Link>
        )}
        
        {/* Bottone Chiudi/Riapri - solo per sondaggi con closure_type='manual' */}
        {(survey?.closure_type === ClosureType.MANUAL || stats.closure_type === ClosureType.MANUAL) && (
          <button
            onClick={handleToggleSurveyStatus}
            disabled={toggling}
            className="btn btn-secondary"
          >
            {(survey?.is_active ?? stats.is_active) ? (
              <>
                <Lock size={18} />
                {toggling ? 'Chiusura...' : 'Chiudi Sondaggio'}
              </>
            ) : (
              <>
                <Unlock size={18} />
                {toggling ? 'Riapertura...' : 'Riapri Sondaggio'}
              </>
            )}
          </button>
        )}

        {/* Bottone Elimina */}
        {survey && (
          <button
            onClick={handleDeleteSurvey}
            disabled={deleting}
            className="btn btn-danger"
          >
            <Trash2 size={18} />
            {deleting ? 'Eliminazione...' : 'Elimina'}
          </button>
        )}

        {/* Indicatore Stato - allineato a destra */}
        <div style={{ marginLeft: 'auto' }}>
          {survey && isClosed(survey) ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              background: '#f1f5f9',
              border: '2px solid #cbd5e1',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#64748b'
            }}>
              <Lock size={18} />
              <span>Concluso</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#15803d'
            }}>
              <Play size={18} />
              <span>Attivo</span>
            </div>
          )}
        </div>
      </div>

      {/* Card informazioni sondaggio - Stile lista */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
            <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
              {stats.survey_title}
            </h2>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {survey && isClosed(survey) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  color: '#64748b',
                  whiteSpace: 'nowrap'
                }}>
                  <Lock size={14} />
                  <span>{isExpired(survey) ? 'Scaduto' : 'Concluso'}</span>
                </div>
              )}

              {/* Badge Tipo Risorsa */}
              {survey?.resource_type && survey.resource_type !== 'none' && getResourceTypeIcon(survey.resource_type) && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    color: '#92400e'
                  }}
                  title={getResourceTypeTitle(survey.resource_type)}
                >
                  {getResourceTypeIcon(survey.resource_type)}
                </div>
              )}

              {stats.question_type && (() => {
                const typeInfo = getQuestionTypeInfo(stats.question_type);
                return (
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
                    {typeInfo.icon}
                    <span>{typeInfo.label}</span>
                  </div>
                );
              })()}

              {/* Indicatore Pubblico/Anonimo */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  background: survey?.is_anonymous ? '#475569' : '#ffffff',
                  border: survey?.is_anonymous ? '1px solid #475569' : '1px solid #e2e8f0',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
                title={survey?.is_anonymous ? 'Sondaggio Anonimo' : 'Sondaggio Pubblico'}
              >
                <User 
                  size={14} 
                  style={{ 
                    color: survey?.is_anonymous ? '#ffffff' : '#475569'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Indicatore gradimento */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center' 
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                alignItems: 'center' 
              }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = Math.round(stats.like_stats?.average_rating || 0);
                  const isFilled = i < rating;
                  const isUserRating = stats.user_like_rating && i < stats.user_like_rating;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: isFilled ? '#10b981' : 'transparent',
                          border: `2px solid ${isFilled ? '#10b981' : '#cbd5e1'}`
                        }}
                      />
                      {isUserRating && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-3px',
                            width: '16px',
                            height: '2px',
                            backgroundColor: '#34d399',
                            borderRadius: '1px'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {stats.like_stats && stats.like_stats.total_likes > 0 && stats.like_stats.average_rating > 0 && (
                <span style={{ 
                  color: '#10b981', 
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {stats.like_stats.average_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {stats.survey_description && (
            <p className="card-description">{stats.survey_description}</p>
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
                {new Date(stats.created_at).toLocaleDateString('it-IT', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {survey?.creator && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: '#94a3b8',
                fontSize: '0.8125rem'
              }}>
                <User size={14} />
                <span>{survey.creator.name}</span>
              </div>
            )}

            {stats.tags && stats.tags.length > 0 && (
              <>
                <span style={{ color: '#cbd5e1' }}>•</span>
                {stats.tags.map(tag => (
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

            {survey && !isClosed(survey) && survey.expires_at && (
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

          {/* Badge informativi e stato voto */}
          <div style={{
            marginTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'nowrap'
          }}>
            {/* Badge informativi a sinistra */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* Badge Modalità Chiusura */}
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
                whiteSpace: 'nowrap',
                height: '32px'
              }}>
                <Clock size={14} />
                <span>
                  {stats.closure_type === 'permanent' && 'Permanente'}
                  {stats.closure_type === 'scheduled' && 'Scadenza Fissata'}
                  {stats.closure_type === 'manual' && 'Chiusura Libera'}
                  {!stats.closure_type && 'Permanente'}
                </span>
              </div>

              {/* Badge Disponibilità Risultati */}
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
                whiteSpace: 'nowrap',
                height: '32px'
              }}>
                <BarChart2 size={14} />
                <span>
                  {stats.show_results_on_close ? 'Risultati alla Chiusura' : 'Risultati Disponibili'}
                </span>
              </div>

              {/* Badge Opzioni Personalizzate */}
              {survey && (
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
                  whiteSpace: 'nowrap',
                  height: '32px'
                }}>
                  <List size={14} />
                  <span>
                    {survey.allow_custom_options ? 'Opzioni Personalizzate' : 'Opzioni Fisse'}
                  </span>
                </div>
              )}
            </div>

            {/* Badge Stato Voto Utente a destra */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              background: stats.has_user_voted ? '#f0fdf4' : '#fef2f2',
              border: stats.has_user_voted ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: stats.has_user_voted ? '#15803d' : '#dc2626',
              fontSize: '0.8125rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              height: '32px',
              flexShrink: 0
            }}>
              {stats.has_user_voted ? <CheckCircle size={14} /> : <Vote size={14} />}
              <span>{stats.has_user_voted ? 'Già Votato' : 'Non Votato'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Statistiche */}
      <div className="card">
        <h1 className="card-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <TrendingUp size={24} style={{ color: '#6366f1' }} />
          Statistiche Sondaggio
        </h1>

        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          {/* Data di Creazione */}
          <div className="stat-card" style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
              <Calendar size={16} style={{ color: '#6366f1' }} />
              <h3 style={{ margin: 0, color: '#6366f1', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Data Creazione
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
              {formatDate(stats.created_at)}
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              {getTimeSinceCreation(stats.created_at)}
            </p>
          </div>

          {/* Partecipanti */}
          <div className="stat-card" style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
              <Users size={16} style={{ color: '#8b5cf6' }} />
              <h3 style={{ margin: 0, color: '#8b5cf6', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Partecipanti
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
              {stats.total_participants}
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              {stats.total_participants === 1 ? 'persona unica' : 'persone uniche'}
            </p>
          </div>

          {/* Voti Totali */}
          <div className="stat-card" style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
              <Vote size={16} style={{ color: '#ec4899' }} />
              <h3 style={{ margin: 0, color: '#ec4899', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Voti Totali
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
              {stats.total_votes}
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              {stats.total_votes === 1 ? 'voto registrato' : 'voti registrati'}
            </p>
          </div>

          {/* Opzioni Disponibili */}
          <div className="stat-card" style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
              <CheckSquare size={16} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, color: '#10b981', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Opzioni
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
              {stats.options_count}
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              {stats.options_count === 1 ? 'opzione disponibile' : 'opzioni disponibili'}
            </p>
          </div>

          {/* Ultimo Voto */}
          <div className="stat-card" style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
              <Clock size={16} style={{ color: '#f59e0b' }} />
              <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ultimo Voto
              </h3>
            </div>
            {stats.last_vote_at ? (
              <>
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                  {formatDateTime(stats.last_vote_at)}
                </p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
                  {getTimeSinceCreation(stats.last_vote_at)}
                </p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                Nessun voto ancora registrato
              </p>
            )}
          </div>
        </div>

        {/* Grafico Andamento Voti */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1.5rem', 
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#0f172a',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <TrendingUp size={16} style={{ color: '#6366f1' }} />
              Andamento Voti nel Tempo
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '400' }}>
              {timeline.length > 0 ? (
                `${granularity === 'hourly' ? 'Granularità: oraria' : 'Granularità: giornaliera'} • ${timeline.length} punti`
              ) : (
                'Caricamento dati...'
              )}
            </span>
          </h4>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} key={`timeline-${timeline.length}-${timeline[0]?.timestamp}`}>
              <LineChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#cbd5e1" 
                  strokeWidth={1}
                  vertical={true} 
                  horizontal={true}
                  verticalPoints={timeline.map((_, i) => i)}
                />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  interval={0}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (granularity === 'hourly') {
                      return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:00`;
                    }
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Partecipanti Cumulativi', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(5, dataMax + 1)]}
                  tickCount={10}
                  interval={0}
                />
                <Tooltip 
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '8px 12px'
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value as string);
                    if (granularity === 'hourly') {
                      return date.toLocaleString('it-IT', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                    return date.toLocaleDateString('it-IT', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    });
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'votes') return [value, 'Partecipanti Totali'];
                    if (name === 'period_votes') return [value, granularity === 'hourly' ? "Partecipanti dell'Ora" : 'Partecipanti del Giorno'];
                    return [value, name];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="votes" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Data', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 12 } }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Partecipanti Cumulativi', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {timeline.length === 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: '#94a3b8',
              fontSize: '0.875rem',
              fontStyle: 'italic'
            }}>
              Nessun partecipante ancora
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyStatsPage;
