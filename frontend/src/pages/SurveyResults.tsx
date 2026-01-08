import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Vote, RefreshCw, TrendingUp, Users, Award, MessageSquare, Calendar, User, Star, Heart, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { SurveyResultsResponse, QuestionType, Survey } from '../types';
import { surveyApi } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';
import LikeRating from '../components/LikeRating';
import BubbleChart from '../components/BubbleChart';

const SurveyResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SurveyResultsResponse | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      loadResults(parseInt(id));
      loadSurvey(parseInt(id));
    }
  }, [id]);

  const loadResults = async (surveyId: number) => {
    try {
      setLoading(true);
      const resultsData = await surveyApi.getSurveyResults(surveyId);
      setResults(resultsData);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei risultati');
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

  const toggleOption = (optionId: number) => {
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const getPercentage = (voteCount: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((voteCount / total) * 100);
  };

  const renderRatingValue = (value: number, icon: string = 'number'): React.ReactNode => {
    const count = Math.floor(value);
    
    if (icon === 'star') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {Array.from({ length: count }).map((_, i) => (
            <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
          ))}
        </span>
      );
    } else if (icon === 'heart') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {Array.from({ length: count }).map((_, i) => (
            <Heart key={i} size={18} fill="#ec4899" color="#ec4899" />
          ))}
        </span>
      );
    } else {
      return <span>{value}</span>;
    }
  };

  if (loading) {
    return <div className="loading">Caricamento risultati...</div>;
  }

  if (error || !results) {
    return (
      <div className="error">
        {error || 'Risultati non trovati'}
        <button onClick={() => navigate('/surveys')} className="btn btn-primary" style={{ marginLeft: '1rem' }}>
          Torna alla Lista
        </button>
      </div>
    );
  }

  // Trova il voto massimo per determinare i risultati primi (possono essere più di uno in caso di pari merito)
  const maxVoteCount = results.results && results.results.length > 0
    ? Math.max(...results.results.map(r => r.vote_count))
    : 0;

  const topResult = results.results && results.results.length > 0 
    ? results.results.reduce((prev, current) => 
        (current.vote_count > prev.vote_count) ? current : prev
      )
    : null;

  const isChoiceType = results.question_type === QuestionType.SINGLE_CHOICE || 
                       results.question_type === QuestionType.MULTIPLE_CHOICE;
  const isNumericType = results.question_type === QuestionType.RATING || 
                        results.question_type === QuestionType.SCALE;
  const isDateType = results.question_type === QuestionType.DATE;

  // Pannello laterale con solo commenti sul gradimento (like_comments)
  const sidebar = (
    <div>
      {/* Sezione Commenti */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <MessageSquare size={20} style={{ color: '#6366f1' }} />
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#0f172a',
          flex: 1
        }}>
          Commenti
        </h3>
        {results && results.like_comments && results.like_comments.length > 0 && (
          <span style={{
            background: '#6366f1',
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
            {results.like_comments.length}
          </span>
        )}
      </div>

      {/* Lista Commenti sul gradimento */}
      {results && results.like_comments && results.like_comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.like_comments.map((comment, index) => (
            <div 
              key={comment.id} 
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header del post */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                {/* Avatar con iniziale */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `hsl(${(index * 137.5) % 360}, 65%, 55%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '0.125rem'
                  }}>
                    {comment.user_name || `Utente #${index + 1}`}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Calendar size={12} />
                    {new Date(comment.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Contenuto del commento */}
              <div style={{
                fontSize: '0.875rem',
                color: '#475569',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {comment.comment}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem 1rem',
          color: '#94a3b8'
        }}>
          <MessageSquare size={32} style={{ 
            margin: '0 auto 0.75rem',
            opacity: 0.5
          }} />
          <p style={{ 
            fontSize: '0.875rem',
            margin: 0
          }}>
            Nessun commento ancora
          </p>
        </div>
      )}
    </div>
  );

  const mainContent = (
    <div>
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
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
          <button onClick={() => navigate(`/survey/${results.survey_id}`)} className="btn btn-primary">
            <Vote size={18} />
            Partecipa
          </button>
        )}
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Titolo e Badges sulla stessa riga */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
            gap: '1rem'
          }}>
            <h1 className="card-title" style={{ marginBottom: 0 }}>Risultati del Sondaggio</h1>
            
            {/* Badges: Gradimento e Tipologia in alto a destra */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              flexShrink: 0
            }}>
              {/* Gradimento */}
              {results.like_stats && results.like_stats.total_likes > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  <LikeRating
                    value={results.like_stats.average_rating || 0}
                    onChange={() => {}}
                    readonly
                    size={14}
                  />
                  <span style={{
                    fontWeight: '500',
                    color: '#065f46'
                  }}>
                    {results.like_stats.average_rating?.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Tipologia sondaggio */}
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: 
                  results.question_type === QuestionType.SINGLE_CHOICE ? '#ede9fe' :
                  results.question_type === QuestionType.MULTIPLE_CHOICE ? '#dbeafe' :
                  results.question_type === QuestionType.RATING ? '#fef3c7' :
                  results.question_type === QuestionType.SCALE ? '#fce7f3' :
                  results.question_type === QuestionType.OPEN_TEXT ? '#f3e8ff' :
                  results.question_type === QuestionType.DATE ? '#fee2e2' :
                  '#e2e8f0',
                color:
                  results.question_type === QuestionType.SINGLE_CHOICE ? '#7c3aed' :
                  results.question_type === QuestionType.MULTIPLE_CHOICE ? '#2563eb' :
                  results.question_type === QuestionType.RATING ? '#d97706' :
                  results.question_type === QuestionType.SCALE ? '#db2777' :
                  results.question_type === QuestionType.OPEN_TEXT ? '#9333ea' :
                  results.question_type === QuestionType.DATE ? '#dc2626' :
                  '#64748b'
              }}>
                {
                  results.question_type === QuestionType.SINGLE_CHOICE ? '📋 Scelta Singola' :
                  results.question_type === QuestionType.MULTIPLE_CHOICE ? '☑️ Scelta Multipla' :
                  results.question_type === QuestionType.RATING ? '⭐ Valutazione' :
                  results.question_type === QuestionType.SCALE ? '📊 Scala Numerica' :
                  results.question_type === QuestionType.OPEN_TEXT ? '💬 Risposta Aperta' :
                  results.question_type === QuestionType.DATE ? '📅 Data' :
                  'Sconosciuto'
                }
              </span>
            </div>
          </div>
          
          <p className="card-description">{results.survey_title}</p>
        </div>
        
        {/* Stats cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.25rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#6366f1' }}>
              <Users size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risposte</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#0f172a' }}>
              {results.total_responses}
            </div>
          </div>

          <div style={{
            padding: '1.25rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#8b5cf6' }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Voti Totali</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#0f172a' }}>
              {results.total_votes}
            </div>
          </div>

          {topResult && results.total_votes > 0 && (isChoiceType || isDateType) && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              gridColumn: results.results.length === 2 ? '1 / -1' : 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ec4899' }}>
                <Award size={16} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isDateType ? 'Data Più Votata' : 'Più Votata'}
                </span>
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0f172a',
                lineHeight: 1.4
              }}>
                {isDateType && topResult.option_text ? (
                  (() => {
                    try {
                      const dateStr = topResult.option_text;
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
                        return date.toLocaleDateString('it-IT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      }
                      return dateStr;
                    } catch {
                      return topResult.option_text;
                    }
                  })()
                ) : (
                  topResult.option_text
                )}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '400' }}>
                {topResult.vote_count} voti ({getPercentage(topResult.vote_count, results.total_votes)}%)
              </div>
            </div>
          )}

          {isNumericType && results.value_distribution && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10b981' }}>
                <Award size={16} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Più Votato</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                {renderRatingValue(results.value_distribution.reduce((max, item) => item.count > max.count ? item : max, results.value_distribution[0]).value, results.rating_icon || 'number')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '400' }}>
                {results.value_distribution.reduce((max, item) => item.count > max.count ? item : max, results.value_distribution[0]).count} voti
              </div>
            </div>
          )}

          {isNumericType && !results.value_distribution && results.numeric_stats && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10b981' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Media</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#0f172a' }}>
                {results.numeric_stats.average.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {results.total_votes === 0 ? (
          <div className="text-center" style={{ padding: '4rem 2rem' }}>
            <Users size={64} style={{
              margin: '0 auto 2rem',
              color: '#94a3b8',
              opacity: 0.5
            }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Nessun voto ancora registrato
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Sii il primo a votare e a far sentire la tua voce!
            </p>
            <button
              onClick={() => navigate(`/survey/${results.survey_id}`)}
              className="btn btn-primary"
            >
              <Vote size={18} />
              Vota Ora
            </button>
          </div>
        ) : (
          <div>
            {/* Choice Results */}
            {isChoiceType && results.results && results.results.length > 0 && (
              <div>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <TrendingUp size={18} style={{ color: '#6366f1' }} />
                  Distribuzione dei Voti:
                </h3>

                {results.results
                  .sort((a, b) => b.vote_count - a.vote_count)
                  .map((result, index) => {
                    const percentage = getPercentage(result.vote_count, results.total_votes);
                    // Badge "Prima": mostra su tutte le opzioni con il voto massimo (pari merito)
                    const isTopResult = maxVoteCount > 0 && result.vote_count === maxVoteCount;
                    // Badge "Me": mostra su tutte le opzioni votate dall'utente
                    const isUserVote = survey && survey.is_anonymous === false && 
                                       (results.question_type === QuestionType.SINGLE_CHOICE || 
                                        results.question_type === QuestionType.MULTIPLE_CHOICE ||
                                        results.question_type === QuestionType.DATE) && 
                                       results.user_voted_option_ids && 
                                       results.user_voted_option_ids.includes(result.option_id!);

                    return (
                      <div
                        key={result.option_id}
                        className="result-item"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          position: 'relative'
                        }}
                      >
                        {isTopResult && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '0.75rem',
                            background: '#ec4899',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 10
                          }}>
                            <Award size={18} strokeWidth={2} />
                          </div>
                        )}

                        {isUserVote && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: isTopResult ? '3.75rem' : '0.75rem',
                            background: '#6366f1',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 10
                          }}>
                            {/* Speech bubble con "Me" */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                              <text x="12" y="13" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui, -apple-system">Me</text>
                            </svg>
                          </div>
                        )}

                        <div className="result-option">
                          <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>
                            {result.option_text}
                          </span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6366f1',
                            fontWeight: '600'
                          }}>
                            {result.vote_count} {result.vote_count === 1 ? 'voto' : 'voti'}
                          </span>
                        </div>

                        <div className="result-bar">
                          <div
                            className="result-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="result-percentage">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Numeric Results with Options (RATING/SCALE with options) */}
            {isNumericType && results.results && results.results.length > 0 && (
              <div>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <TrendingUp size={18} style={{ color: '#6366f1' }} />
                  {results.question_type === QuestionType.RATING ? 'Distribuzione delle Valutazioni:' : 'Distribuzione dei Valori:'}
                </h3>

                {/* Bubble Chart per RATING e SCALE */}
                {(results.question_type === QuestionType.RATING || results.question_type === QuestionType.SCALE) && survey && (
                  <BubbleChart
                    data={results.results.sort((a, b) => (b.numeric_average || 0) - (a.numeric_average || 0))}
                    minValue={survey.min_value || 1}
                    maxValue={survey.max_value || 5}
                    ratingIcon={results.question_type === QuestionType.SCALE ? 'number' : (results.rating_icon || 'number')}
                    userNumericVotes={survey.is_anonymous === false ? results.user_numeric_votes : undefined}
                  />
                )}
              </div>
            )}

            {/* Numeric Stats - Bar Chart for Rating and Scale (senza opzioni) */}
            {isNumericType && !results.results?.length && results.value_distribution && (
              <div>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <TrendingUp size={18} style={{ color: '#6366f1' }} />
                  Distribuzione dei Voti:
                </h3>

                {results.value_distribution
                  .sort((a, b) => a.value - b.value)
                  .map((item, index) => {
                    const percentage = getPercentage(item.count, results.total_votes);
                    const maxCount = Math.max(...results.value_distribution!.map(d => d.count));
                    const isHighest = item.count === maxCount && item.count > 0;

                    return (
                      <div
                        key={item.value}
                        className="result-item"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          position: 'relative'
                        }}
                      >
                        {isHighest && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '0.75rem',
                            background: '#ec4899',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 10
                          }}>
                            <Award size={18} strokeWidth={2} />
                          </div>
                        )}

                        <div className="result-option">
                          <span style={{ fontSize: '0.9375rem', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                            {renderRatingValue(item.value, results.rating_icon || 'number')}
                          </span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6366f1',
                            fontWeight: '600'
                          }}>
                            {item.count} {item.count === 1 ? 'voto' : 'voti'}
                          </span>
                        </div>

                        <div className="result-bar">
                          <div
                            className="result-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="result-percentage">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Numeric Stats - Only for numeric types without value distribution */}
            {isNumericType && !results.value_distribution && results.numeric_stats && (
              <div>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <TrendingUp size={18} style={{ color: '#6366f1' }} />
                  Statistiche Numeriche:
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                      Media
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#6366f1' }}>
                      {results.numeric_stats.average.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                      Mediana
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#8b5cf6' }}>
                      {results.numeric_stats.median.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                      Min
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981' }}>
                      {results.numeric_stats.min_value}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                      Max
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ec4899' }}>
                      {results.numeric_stats.max_value}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Date Results */}
            {isDateType && results.results && results.results.length > 0 && (
              <div>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Calendar size={18} style={{ color: '#6366f1' }} />
                  Distribuzione dei Voti per Data:
                </h3>

                {results.results
                  .sort((a, b) => b.vote_count - a.vote_count)
                  .map((result, index) => {
                    const percentage = getPercentage(result.vote_count, results.total_votes);
                    // Badge "Prima": mostra su tutte le date con il voto massimo (pari merito)
                    const isTopResult = maxVoteCount > 0 && result.vote_count === maxVoteCount;
                    // Badge "Me": mostra su tutte le date votate dall'utente
                    const isUserVote = survey && survey.is_anonymous === false && 
                                       results.question_type === QuestionType.DATE && 
                                       results.user_voted_option_ids && 
                                       results.user_voted_option_ids.includes(result.option_id!);
                    
                    // Formatta la data in italiano
                    let formattedDate = result.option_text || '';
                    let dateSubtext = result.option_text || '';
                    try {
                      const dateStr = result.option_text || '';
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
                        dateSubtext = date.toLocaleDateString('it-IT');
                      }
                    } catch (e) {
                      // Se non è una data valida, usa il testo così com'è
                    }

                    return (
                      <div
                        key={result.option_id}
                        className="result-item"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          position: 'relative'
                        }}
                      >
                        {isTopResult && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '0.75rem',
                            background: '#ec4899',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 10
                          }}>
                            <Award size={18} strokeWidth={2} />
                          </div>
                        )}

                        {isUserVote && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: isTopResult ? '3.75rem' : '0.75rem',
                            background: '#6366f1',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 10
                          }}>
                            {/* Speech bubble con "Me" */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                              <text x="12" y="13" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui, -apple-system">Me</text>
                            </svg>
                          </div>
                        )}

                        <div className="result-option">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.9375rem', fontWeight: '600', textTransform: 'capitalize' }}>
                              {formattedDate}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {dateSubtext}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6366f1',
                            fontWeight: '600'
                          }}>
                            {result.vote_count} {result.vote_count === 1 ? 'voto' : 'voti'}
                          </span>
                        </div>

                        <div className="result-bar">
                          <div
                            className="result-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="result-percentage">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Open Text Results with Options */}
            {results.question_type === QuestionType.OPEN_TEXT && results.results && results.results.length > 0 && results.open_responses && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{
                  marginBottom: '1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <MessageSquare size={18} style={{ color: '#6366f1' }} />
                  Risposte Aperte per Opzione:
                </h3>

                {results.results.map((option) => {
                  // Filtra le risposte per questa opzione
                  const optionResponses = results.open_responses?.filter(r => r.option_id === option.option_id) || [];
                  const isExpanded = expandedOptions.has(option.option_id!);
                  
                  return (
                    <div key={option.option_id} style={{ marginBottom: '2rem' }}>
                      <div 
                        onClick={() => optionResponses.length > 0 && toggleOption(option.option_id!)}
                        style={{
                          background: '#f8fafc',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          marginBottom: isExpanded ? '1rem' : '0',
                          cursor: optionResponses.length > 0 ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          ...(optionResponses.length > 0 && {
                            ':hover': {
                              background: '#f1f5f9',
                              borderColor: '#cbd5e1'
                            }
                          })
                        }}
                        onMouseEnter={(e) => {
                          if (optionResponses.length > 0) {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (optionResponses.length > 0) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#0f172a',
                            marginBottom: '0.25rem'
                          }}>
                            {option.option_text}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#64748b'
                          }}>
                            {optionResponses.length} {optionResponses.length === 1 ? 'risposta' : 'risposte'}
                          </div>
                        </div>
                        {optionResponses.length > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#6366f1',
                            transition: 'transform 0.2s ease'
                          }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        )}
                      </div>

                      {isExpanded && optionResponses.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.75rem', 
                          paddingLeft: '1rem',
                          animation: 'fadeIn 0.2s ease'
                        }}>
                          {optionResponses.map((response, index) => {
                            // Badge "Me": mostra per le risposte dell'utente (solo sondaggi non anonimi)
                            const isUserResponse = survey && survey.is_anonymous === false && 
                                                   results.user_response_ids && 
                                                   results.user_response_ids.includes(response.id);
                            
                            return (
                            <div
                              key={response.id}
                              style={{
                                background: '#ffffff',
                                borderRadius: '6px',
                                padding: '0.875rem',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.875rem',
                                color: '#475569',
                                  lineHeight: 1.6,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  position: 'relative'
                              }}
                            >
                                {isUserResponse && (
                              <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '0.75rem',
                                    background: '#6366f1',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    border: '2px solid white',
                                    zIndex: 10
                              }}>
                                    {/* Speech bubble con "Me" */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                                      <text x="12" y="13" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui, -apple-system">Me</text>
                                    </svg>
                              </div>
                                )}
                                {response.response_text}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => loadResults(results.survey_id)}
            className="btn btn-secondary"
          >
            <RefreshCw size={18} />
            Aggiorna Risultati
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout 
      sidebar={sidebar} 
      sidebarPosition="right"
      mobileToggleLabel="Visualizza Commenti"
    >
      {mainContent}
    </SidebarLayout>
  );
};

export default SurveyResults;
