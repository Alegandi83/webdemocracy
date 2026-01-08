import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Vote, BarChart2, TrendingUp, Calendar, FileText, X, Star, CheckCircle, CheckSquare, MessageSquare, Hash, List as ListIcon, Filter, Lock, User, Users, ArrowUpDown, Play, Eye, EyeOff, Link as LinkIcon, Image as ImageIcon, Newspaper, XCircle } from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState<'active' | 'closed'>('active');
  const [filterLikeRating, setFilterLikeRating] = useState<'all' | '1+' | '2+' | '3+' | '4+' | '5'>('all');
  
  // Nuovi filtri
  const [filterMySurveys, setFilterMySurveys] = useState<boolean>(false);
  const [filterVotedStatus, setFilterVotedStatus] = useState<'all' | 'voted' | 'not_voted'>('all');
  const [filterResultsAvailability, setFilterResultsAvailability] = useState<'all' | 'available' | 'on_close'>('all');
  const [filterAnonymousType, setFilterAnonymousType] = useState<'all' | 'public' | 'anonymous'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most_voted' | 'most_liked' | 'expiring'>('recent');

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [filterMySurveys, filterVotedStatus]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const surveysData = await surveyApi.getAllSurveys({
        my_surveys: filterMySurveys,
        voted_status: filterVotedStatus === 'all' ? undefined : filterVotedStatus
      });
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

  const clearFilters = () => {
    setFilterType('all');
    setFilterTag('all');
    setFilterStatus('active');
    setFilterLikeRating('all');
    setFilterMySurveys(false);
    setFilterVotedStatus('all');
    setFilterResultsAvailability('all');
    setFilterAnonymousType('all');
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
        return null; // Non mostrare badge per "nessuna risorsa"
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

  const isClosed = (survey: Survey) => {
    // Un sondaggio è chiuso se:
    // 1. È scaduto (expires_at nel passato)
    // 2. È stato chiuso manualmente (is_active = false)
    return isExpired(survey) || !survey.is_active;
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

    // Filtro stato: attivi vs conclusi (scaduti o chiusi manualmente)
    if (filterStatus === 'active') {
      // Mostra solo sondaggi attivi (non scaduti e non chiusi)
      if (!survey.is_active || isExpired(survey)) {
        return false;
      }
    } else if (filterStatus === 'closed') {
      // Mostra solo sondaggi conclusi (scaduti O chiusi manualmente)
      if (!isClosed(survey)) {
        return false;
      }
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

    // Filtro disponibilità risultati
    if (filterResultsAvailability !== 'all') {
      const closed = isClosed(survey);
      if (filterResultsAvailability === 'available') {
        // Mostra solo sondaggi con risultati disponibili (non hanno flag o sono chiusi)
        if (survey.show_results_on_close && !closed) {
          return false;
        }
      } else if (filterResultsAvailability === 'on_close') {
        // Mostra solo sondaggi con flag "risultati alla chiusura"
        if (!survey.show_results_on_close) {
          return false;
        }
      }
    }

    // Filtro tipo sondaggio (pubblico/anonimo)
    if (filterAnonymousType !== 'all') {
      if (filterAnonymousType === 'public') {
        // Mostra solo sondaggi pubblici (non anonimi)
        if (survey.is_anonymous) {
          return false;
        }
      } else if (filterAnonymousType === 'anonymous') {
        // Mostra solo sondaggi anonimi
        if (!survey.is_anonymous) {
          return false;
        }
      }
    }

    return true;
  });

  // Applica ordinamento
  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        // Più recenti prima
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      
      case 'most_voted':
        // Più votati prima (basato su unique_participants)
        return (b.unique_participants || 0) - (a.unique_participants || 0);
      
      case 'most_liked':
        // Più graditi prima (basato su average_like_rating)
        const aRating = a.average_like_rating || 0;
        const bRating = b.average_like_rating || 0;
        return bRating - aRating;
      
      case 'expiring':
        // In scadenza prima, escludendo chiusi (scaduti o chiusi manualmente)
        const aClosed = isClosed(a);
        const bClosed = isClosed(b);
        
        // Escludi sondaggi chiusi
        if (aClosed && !bClosed) return 1;
        if (!aClosed && bClosed) return -1;
        if (aClosed && bClosed) return 0;
        
        // Sondaggi senza scadenza vanno in fondo
        if (!a.expires_at && !b.expires_at) return 0;
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        
        // Ordina per data di scadenza (più vicina prima)
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      
      default:
        return 0;
    }
  });

  const activeFiltersCount = 
    (filterType !== 'all' ? 1 : 0) + 
    (filterTag !== 'all' ? 1 : 0) + 
    (filterLikeRating !== 'all' ? 1 : 0) +
    (filterMySurveys ? 1 : 0) +
    (filterVotedStatus !== 'all' ? 1 : 0) +
    (filterResultsAvailability !== 'all' ? 1 : 0) +
    (filterAnonymousType !== 'all' ? 1 : 0);

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
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ 
          fontSize: '0.8125rem', 
          fontWeight: '600',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          flex: '0 0 auto'
        }}>
          Tipo Domanda
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="form-input"
          style={{
            margin: 0,
            flex: 1,
            padding: '0.5rem 0.75rem',
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
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ 
            fontSize: '0.8125rem', 
            fontWeight: '600',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            flex: '0 0 auto'
          }}>
            Tag
          </label>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="form-input"
            style={{
              margin: 0,
              flex: 1,
              padding: '0.5rem 0.75rem',
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
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterStatus('active')}
            style={{
              flex: 1,
              padding: '0.625rem 0.875rem',
              borderRadius: '6px',
              border: filterStatus === 'active' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: filterStatus === 'active' ? '#6366f1' : 'white',
              color: filterStatus === 'active' ? 'white' : '#475569',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Play size={16} /> Attivi
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            style={{
              flex: 1,
              padding: '0.625rem 0.875rem',
              borderRadius: '6px',
              border: filterStatus === 'closed' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: filterStatus === 'closed' ? '#6366f1' : 'white',
              color: filterStatus === 'closed' ? 'white' : '#475569',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Lock size={16} /> Conclusi
          </button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {[
            { value: 'all', label: 'All', dots: 0 },
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
                padding: '0.5rem 0.625rem',
                borderRadius: '6px',
                border: filterLikeRating === option.value ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: filterLikeRating === option.value ? '#ecfdf5' : 'white',
                color: '#475569',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                minHeight: '60px',
                justifyContent: 'center'
              }}
            >
              {option.dots > 0 && (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  {Array.from({ length: option.dots }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid #10b981'
                      }}
                    />
                  ))}
                </div>
              )}
              <span style={{ fontSize: option.dots === 0 ? '0.75rem' : '0.8125rem' }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtro Disponibilità Risultati */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <label style={{ 
            fontSize: '0.8125rem', 
            fontWeight: '600',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0
          }}>
            Disponibilità Risultati
          </label>
          <button
            onClick={() => setFilterResultsAvailability('all')}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: filterResultsAvailability === 'all' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: filterResultsAvailability === 'all' ? '#6366f1' : 'white',
              color: filterResultsAvailability === 'all' ? 'white' : '#475569',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ListIcon size={14} /> All
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterResultsAvailability('available')}
            style={{
              flex: 1,
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: filterResultsAvailability === 'available' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: filterResultsAvailability === 'available' ? '#6366f1' : 'white',
              color: filterResultsAvailability === 'available' ? 'white' : '#475569',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Eye size={16} /> Disponibili
          </button>
          <button
            onClick={() => setFilterResultsAvailability('on_close')}
            style={{
              flex: 1,
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: filterResultsAvailability === 'on_close' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: filterResultsAvailability === 'on_close' ? '#6366f1' : 'white',
              color: filterResultsAvailability === 'on_close' ? 'white' : '#475569',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <EyeOff size={16} /> Alla Chiusura
          </button>
        </div>
      </div>

      {/* Filtro Tipo Sondaggio (Pubblico/Anonimo) */}
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ 
          fontSize: '0.8125rem', 
          fontWeight: '600',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.75rem',
          display: 'block'
        }}>
          Tipo Sondaggio
        </label>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
          {/* Pulsante All */}
          <button
            onClick={() => setFilterAnonymousType('all')}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: '6px',
              border: filterAnonymousType === 'all' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: 'white',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
            title="Tutti i sondaggi"
          >
            <User 
              size={16} 
              style={{ 
                color: '#475569'
              }} 
            />
            <div style={{
              background: '#475569',
              borderRadius: '3px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User 
                size={16} 
                style={{ 
                  color: 'white'
                }} 
              />
            </div>
          </button>
          
          {/* Pulsante Pubblici */}
          <button
            onClick={() => setFilterAnonymousType('public')}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: '6px',
              border: filterAnonymousType === 'public' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sondaggi Pubblici"
          >
            <User size={16} />
          </button>
          
          {/* Pulsante Anonimi - colori invertiti */}
          <button
            onClick={() => setFilterAnonymousType('anonymous')}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: '6px',
              border: filterAnonymousType === 'anonymous' ? '2px solid #6366f1' : '1px solid #475569',
              background: '#475569',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sondaggi Anonimi"
          >
            <User 
              size={16} 
              style={{ 
                color: 'white'
              }} 
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Caricamento sondaggi...</div>;
  }

  // Calcola le statistiche dei sondaggi filtrati e ordinati
  const totalFilteredSurveys = sortedSurveys.length;
  
  // Utenti unici totali (utenti distinti che hanno partecipato ad almeno un sondaggio)
  const uniqueUsers = new Set(
    sortedSurveys.flatMap(survey => survey.participant_user_ids || [])
  ).size;
  
  // Partecipazioni totali (somma degli utenti unici per ogni sondaggio)
  const totalFilteredParticipations = sortedSurveys.reduce(
    (sum, survey) => sum + (survey.unique_participants || 0), 
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
              background: '#fef3c7',
              border: '2px solid #fde68a'
            }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#d97706',
                lineHeight: '1'
              }}>
                {uniqueUsers}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#92400e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '0.25rem'
              }}>
                {uniqueUsers === 1 ? 'Utente' : 'Utenti'}
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

        {/* Filtri rapidi */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: 'var(--radius)',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setFilterMySurveys(!filterMySurveys)}
            className={`btn ${filterMySurveys ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <User size={16} />
            Miei Sondaggi
          </button>

          <button
            onClick={() => setFilterVotedStatus(filterVotedStatus === 'voted' ? 'all' : 'voted')}
            className={`btn ${filterVotedStatus === 'voted' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={16} />
            Già Votati
          </button>

          <button
            onClick={() => setFilterVotedStatus(filterVotedStatus === 'not_voted' ? 'all' : 'not_voted')}
            className={`btn ${filterVotedStatus === 'not_voted' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Vote size={16} />
            Non Votati
          </button>

          {(filterMySurveys || filterVotedStatus !== 'all') && (
            <button
              onClick={() => {
                setFilterMySurveys(false);
                setFilterVotedStatus('all');
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: 'auto'
              }}
            >
              <X size={16} />
              Clear
            </button>
          )}

          {/* Divisore verticale */}
          <div style={{
            width: '1px',
            height: '38px',
            background: '#cbd5e1',
            margin: '0 0.25rem',
            marginLeft: 'auto'
          }} />

          {/* Selettore ordinamento */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ArrowUpDown size={16} style={{ color: '#64748b' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'most_voted' | 'most_liked' | 'expiring')}
              className="form-input"
              style={{
                margin: 0,
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: 'white',
                color: '#0f172a',
                fontWeight: '500'
              }}
            >
              <option value="recent">Più recenti</option>
              <option value="most_voted">Più votati</option>
              <option value="most_liked">Più graditi</option>
              <option value="expiring">In scadenza</option>
            </select>
          </div>
        </div>

        {sortedSurveys.length === 0 ? (
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
            {sortedSurveys.map((survey) => {
              const expired = isExpired(survey);
              const closed = isClosed(survey);
              
              return (
                <div key={survey.id} className="card">
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                      <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
                        {survey.title}
                      </h2>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {closed && (
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
                            <span>{expired ? 'Scaduto' : 'Concluso'}</span>
                          </div>
                        )}

                        {/* Badge Tipo Risorsa */}
                        {survey.resource_type && survey.resource_type !== 'none' && getResourceTypeIcon(survey.resource_type) && (
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

                        {/* Indicatore Pubblico/Anonimo */}
                        <div 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '6px',
                            background: survey.is_anonymous ? '#475569' : '#ffffff',
                            border: survey.is_anonymous ? '1px solid #475569' : '1px solid #e2e8f0',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                          title={survey.is_anonymous ? 'Sondaggio Anonimo' : 'Sondaggio Pubblico'}
                        >
                          <User 
                            size={14} 
                            style={{ 
                              color: survey.is_anonymous ? '#ffffff' : '#475569'
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
                            const rating = Math.round(survey.average_like_rating || 0);
                            const isFilled = i < rating;
                            const isUserRating = survey.user_like_rating && i < survey.user_like_rating;
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
                        {survey.average_like_rating !== null && survey.average_like_rating !== undefined && survey.average_like_rating > 0 && (
                          <span style={{ 
                            color: '#10b981', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {survey.average_like_rating.toFixed(1)}
                          </span>
                        )}
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

                      {survey.creator && (
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

                      {!closed && survey.expires_at && (
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
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {closed ? (
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
                      {survey.show_results_on_close && !closed ? (
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
                        <Link to={`/survey/${survey.id}/results`} className="btn btn-secondary">
                          <BarChart2 size={18} />
                          Vedi Risultati
                        </Link>
                      )}
                      <Link to={`/survey/${survey.id}/stats`} className="btn btn-stats">
                        <TrendingUp size={18} />
                        Statistiche
                      </Link>
                    </div>
                    
                    {/* Gruppo Badge: Stato Voto + Partecipazioni */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {/* Badge Stato Voto Utente */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: survey.has_user_voted ? '#f0fdf4' : '#fef2f2',
                        border: survey.has_user_voted ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        color: survey.has_user_voted ? '#15803d' : '#dc2626',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {survey.has_user_voted ? <CheckCircle size={16} /> : <Vote size={16} />}
                        <span>{survey.has_user_voted ? 'Già Votato' : 'Non Votato'}</span>
                      </div>

                      {/* Indicatore partecipazioni */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        <Users size={16} />
                        <span>{survey.unique_participants || 0}</span>
                      </div>
                    </div>
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
