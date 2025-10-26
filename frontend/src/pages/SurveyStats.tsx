import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Vote, BarChart2, Calendar, Users, CheckSquare, Clock, TrendingUp, MessageSquare, Star, List, CheckCircle, ThumbsUp } from 'lucide-react';
import { SurveyStats, QuestionType } from '../types';
import { surveyApi } from '../services/api';
import LikeRating from '../components/LikeRating';

const SurveyStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadStats(parseInt(id));
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
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/surveys')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Torna alla Lista
        </button>
        <Link to={`/survey/${stats.survey_id}`} className="btn btn-primary">
          <Vote size={18} />
          Partecipa
        </Link>
        <Link to={`/survey/${stats.survey_id}/results`} className="btn btn-secondary">
          <BarChart2 size={18} />
          Risultati
        </Link>
      </div>

      <div className="card">
        <h1 className="card-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          <TrendingUp size={24} style={{ color: '#6366f1' }} />
          Statistiche Sondaggio
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: '#0f172a', 
            marginBottom: '0.625rem',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            {stats.survey_title}
          </h2>
          {stats.survey_description && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.1)'
            }}>
              <MessageSquare size={20} style={{ 
                color: '#667eea', 
                flexShrink: 0,
                marginTop: '0.125rem' 
              }} />
              <p style={{ 
                color: '#475569', 
                margin: 0,
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                {stats.survey_description}
              </p>
            </div>
          )}

          {/* Tipologia Sondaggio */}
          {stats.question_type && (() => {
            const typeInfo = getQuestionTypeInfo(stats.question_type);
            return (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: `${typeInfo.color}15`,
                borderRadius: '8px',
                border: `2px solid ${typeInfo.color}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ 
                  color: typeInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'white'
                }}>
                  {typeInfo.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.8125rem', 
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    marginBottom: '0.25rem'
                  }}>
                    Tipologia Sondaggio
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    color: '#0f172a'
                  }}>
                    {typeInfo.label}
                  </div>
                  {typeInfo.description && (
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      color: '#64748b',
                      marginTop: '0.125rem'
                    }}>
                      {typeInfo.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Tags */}
          {stats.tags && stats.tags.length > 0 && (
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: '0.8125rem', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                Tag:
              </span>
              {stats.tags.map(tag => (
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
        </div>

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

          {/* Gradimento */}
          {stats.like_stats && stats.like_stats.total_likes > 0 && (
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
                <ThumbsUp size={16} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Gradimento
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <LikeRating value={Math.round(stats.like_stats.average_rating)} readonly size={20} />
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', color: '#0f172a' }}>
                  {stats.like_stats.average_rating.toFixed(1)}/5
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
                {stats.like_stats.total_likes} {stats.like_stats.total_likes === 1 ? 'valutazione' : 'valutazioni'}
              </p>
            </div>
          )}
        </div>

        {/* Ultimo Voto */}
        <div style={{ 
          background: '#ffffff', 
          padding: '1.25rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.375rem' }}>
            <Clock size={16} style={{ color: '#6366f1' }} />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '600' }}>
              Ultimo Voto
            </h3>
          </div>
          {stats.last_vote_at ? (
            <div>
              <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                {formatDateTime(stats.last_vote_at)}
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
                {getTimeSinceCreation(stats.last_vote_at)}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic' }}>
              Nessun voto ancora registrato
            </p>
          )}
        </div>

        {/* Riepilogo */}
        {stats.total_votes > 0 && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1.25rem', 
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#0f172a',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <TrendingUp size={16} style={{ color: '#6366f1' }} />
              Riepilogo Attività
            </h4>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, fontSize: '0.9375rem' }}>
              Questo sondaggio ha ricevuto <strong style={{ color: '#0f172a' }}>{stats.total_votes}</strong> voti da <strong style={{ color: '#0f172a' }}>{stats.total_participants}</strong> partecipanti{' '}
              {stats.total_participants !== stats.total_votes && 
                `(in media ${(stats.total_votes / stats.total_participants).toFixed(1)} voti per partecipante)`
              }.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyStatsPage;
