import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, PlusCircle, X, Save, ArrowLeft, Calendar, Settings, Star, Heart, Hash, CheckCircle, CheckSquare, BarChart2, Type, User, Link as LinkIcon, Image as ImageIcon, Newspaper, XCircle, Upload } from 'lucide-react';
import { surveyApi } from '../services/api';
import { SurveyCreate, QuestionType, ClosureType } from '../types';
import TagManager from '../components/TagManager';

const CreateSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyCreate>({
    title: '',
    description: '',
    question_type: QuestionType.SINGLE_CHOICE,
    closure_type: ClosureType.PERMANENT,
    options: ['', ''],
    tag_ids: [],
    allow_multiple_responses: false,
    allow_custom_options: false,
    require_comment: false,
    show_results_on_close: false,
    is_anonymous: false,
    rating_icon: 'star',
    min_value: 1,
    max_value: 5,
    resource_type: 'none',
    resource_url: undefined,
    resource_news_id: undefined
  });
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Carica le news per la selezione
  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          setNewsList(data.items || data || []);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      }
    };
    loadNews();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione tipo file
    if (!file.type.startsWith('image/')) {
      setError('Per favore seleziona un file immagine valido');
      return;
    }

    // Validazione dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere inferiore a 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Crea FormData per l'upload
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          resource_type: 'image',
          resource_url: data.url
        }));
        setImagePreview(data.url);
      } else {
        setError('Errore durante l\'upload dell\'immagine');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Errore durante l\'upload dell\'immagine');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    if (!formData.title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    
    // Validazione opzioni
    const validOptions = formData.options.filter(opt => opt.trim());
    
    // Per SINGLE_CHOICE e MULTIPLE_CHOICE le opzioni sono obbligatorie (minimo 2)
    if ([QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE].includes(formData.question_type)) {
      if (validOptions.length < 2) {
        setError('Devi inserire almeno 2 opzioni');
        return;
      }
    }
    
    // Per RATING, SCALE e OPEN_TEXT, le opzioni possono essere anche una sola
    // Per DATE, se ci sono opzioni devono essere almeno 2
    if (formData.question_type === QuestionType.DATE) {
      if (validOptions.length > 0 && validOptions.length < 2) {
        setError('Se inserisci delle opzioni, devi inserirne almeno 2');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const surveyToCreate: SurveyCreate = {
        ...formData,
        options: validOptions
      };
      
      // Normalizza l'URL aggiungendo https:// se mancante
      if (surveyToCreate.resource_type === 'url' && surveyToCreate.resource_url) {
        const url = surveyToCreate.resource_url.trim();
        if (url && !url.match(/^https?:\/\//i)) {
          surveyToCreate.resource_url = `https://${url}`;
        }
      }
      
      // Combina data e orario solo se closure_type è 'scheduled'
      if (formData.closure_type === ClosureType.SCHEDULED) {
        if (expiryDate && expiryTime) {
          // Crea un oggetto Date locale e convertilo in ISO string
          const localDateTime = new Date(`${expiryDate}T${expiryTime}:00`);
          surveyToCreate.expires_at = localDateTime.toISOString();
        } else if (expiryDate) {
          // Se solo data, imposta a fine giornata
          const localDateTime = new Date(`${expiryDate}T23:59:00`);
          surveyToCreate.expires_at = localDateTime.toISOString();
        } else {
          // Se closure_type è scheduled ma non c'è data, errore
          setError('Per un sondaggio con scadenza fissata devi impostare una data di scadenza');
          setLoading(false);
          return;
        }
      }
      
      const newSurvey = await surveyApi.createSurvey(surveyToCreate);
      navigate(`/survey/${newSurvey.id}`);
    } catch (err) {
      setError('Errore nella creazione del sondaggio');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    // Per RATING, SCALE e OPEN_TEXT, minimo 1 opzione
    // Per SINGLE_CHOICE, MULTIPLE_CHOICE e DATE, minimo 2 opzioni
    const minOptions = [QuestionType.RATING, QuestionType.SCALE, QuestionType.OPEN_TEXT].includes(formData.question_type) ? 1 : 2;
    
    if (formData.options.length > minOptions) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const questionTypeOptions = [
    { value: QuestionType.SINGLE_CHOICE, label: 'Scelta Singola', icon: <CheckCircle size={20} />, color: '#6366f1' },
    { value: QuestionType.MULTIPLE_CHOICE, label: 'Scelta Multipla', icon: <CheckSquare size={20} />, color: '#8b5cf6' },
    { value: QuestionType.RATING, label: 'Valutazione', icon: <Star size={20} />, color: '#fbbf24' },
    { value: QuestionType.SCALE, label: 'Scala Numerica', icon: <BarChart2 size={20} />, color: '#10b981' },
    { value: QuestionType.OPEN_TEXT, label: 'Risposta Aperta', icon: <Type size={20} />, color: '#ec4899' },
    { value: QuestionType.DATE, label: 'Data', icon: <Calendar size={20} />, color: '#f59e0b' },
  ];

  // Ora tutti i tipi di sondaggio possono avere opzioni
  const showOptions = true;
  const showRatingOptions = formData.question_type === QuestionType.RATING;
  const showScaleOptions = formData.question_type === QuestionType.SCALE;
  
  // Helper per il testo delle opzioni in base al tipo di sondaggio
  const getOptionsLabel = () => {
    switch (formData.question_type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        return 'Opzioni di Risposta';
      case QuestionType.RATING:
        return 'Opzioni da Valutare (opzionale)';
      case QuestionType.SCALE:
        return 'Opzioni da Valutare (opzionale)';
      case QuestionType.OPEN_TEXT:
        return 'Campi di Risposta (opzionale)';
      case QuestionType.DATE:
        return 'Date Proposte tra cui Scegliere (opzionale)';
      default:
        return 'Opzioni';
    }
  };
  
  const getOptionsHelp = () => {
    switch (formData.question_type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        return 'Inserisci le opzioni tra cui scegliere (minimo 2)';
      case QuestionType.RATING:
      case QuestionType.SCALE:
        return 'Es: "Qualità", "Velocità", "Cortesia". Gli utenti potranno valutare ogni opzione';
      case QuestionType.OPEN_TEXT:
        return 'Es: "Prodotto A", "Servizio B". Gli utenti potranno commentare su ogni opzione';
      case QuestionType.DATE:
        return 'Seleziona le date proposte tra cui gli utenti potranno scegliere o proporne una nuova';
      default:
        return '';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          color: '#0f172a',
          marginBottom: '0.375rem'
        }}>
          Crea Nuovo Sondaggio
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.9375rem',
          fontWeight: '400'
        }}>
          Configura il tuo sondaggio con opzioni avanzate
        </p>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* CARD 1: Titolo e Descrizione */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#0f172a',
              margin: 0
            }}>
              📝 Informazioni di Base
            </h2>
            
            {/* Bottoni Pubblico/Anonimo */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_anonymous: false }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    background: !formData.is_anonymous ? '#ffffff' : '#f8fafc',
                    border: !formData.is_anonymous ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  title="Sondaggio Pubblico"
                >
                  <User 
                    size={14} 
                    style={{ 
                      color: !formData.is_anonymous ? '#6366f1' : '#475569'
                    }} 
                  />
                </button>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: !formData.is_anonymous ? '600' : '400',
                  color: !formData.is_anonymous ? '#0f172a' : '#64748b'
                }}>
                  Pubblico
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_anonymous: true }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    background: formData.is_anonymous ? '#475569' : '#f8fafc',
                    border: formData.is_anonymous ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  title="Sondaggio Anonimo"
                >
                  <User 
                    size={14} 
                    style={{ 
                      color: formData.is_anonymous ? '#ffffff' : '#475569'
                    }} 
                  />
                </button>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: formData.is_anonymous ? '600' : '400',
                  color: formData.is_anonymous ? '#0f172a' : '#64748b'
                }}>
                  Anonimo
                </span>
              </div>
            </div>
          </div>
          
          {/* Titolo */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={20} />
              Titolo del Sondaggio *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Es: Qual è la tua opinione sul servizio?"
              required
            />
          </div>

          {/* Descrizione */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={20} />
              Descrizione (opzionale)
            </label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Aggiungi una descrizione per fornire più contesto..."
            />
          </div>
        </div>

        {/* CARD 2: Risorsa del Sondaggio */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#0f172a',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            📎 Risorsa del Sondaggio
          </h2>

          {/* Pulsanti Tipo Risorsa */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, resource_type: 'none', resource_url: undefined, resource_news_id: undefined }));
                setImagePreview(null);
              }}
              style={{
                flex: '1 1 calc(25% - 1rem)',
                minWidth: '150px',
                padding: '1rem',
                borderRadius: '8px',
                border: formData.resource_type === 'none' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: formData.resource_type === 'none' ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <XCircle size={24} color={formData.resource_type === 'none' ? '#6366f1' : '#64748b'} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: formData.resource_type === 'none' ? '#6366f1' : '#64748b' }}>
                Nessuna Risorsa
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, resource_type: 'url', resource_news_id: undefined }));
                setImagePreview(null);
              }}
              style={{
                flex: '1 1 calc(25% - 1rem)',
                minWidth: '150px',
                padding: '1rem',
                borderRadius: '8px',
                border: formData.resource_type === 'url' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: formData.resource_type === 'url' ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <LinkIcon size={24} color={formData.resource_type === 'url' ? '#6366f1' : '#64748b'} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: formData.resource_type === 'url' ? '#6366f1' : '#64748b' }}>
                URL
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, resource_type: 'news', resource_url: undefined }));
                setImagePreview(null);
              }}
              style={{
                flex: '1 1 calc(25% - 1rem)',
                minWidth: '150px',
                padding: '1rem',
                borderRadius: '8px',
                border: formData.resource_type === 'news' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: formData.resource_type === 'news' ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Newspaper size={24} color={formData.resource_type === 'news' ? '#6366f1' : '#64748b'} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: formData.resource_type === 'news' ? '#6366f1' : '#64748b' }}>
                Notizia
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('image-upload')?.click();
              }}
              style={{
                flex: '1 1 calc(25% - 1rem)',
                minWidth: '150px',
                padding: '1rem',
                borderRadius: '8px',
                border: formData.resource_type === 'image' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: formData.resource_type === 'image' ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ImageIcon size={24} color={formData.resource_type === 'image' ? '#6366f1' : '#64748b'} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: formData.resource_type === 'image' ? '#6366f1' : '#64748b' }}>
                Immagine
              </span>
            </button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Campo URL */}
          {formData.resource_type === 'url' && (
            <div className="form-group">
              <label className="form-label">
                <LinkIcon size={20} />
                URL della Risorsa
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.resource_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, resource_url: e.target.value }))}
                placeholder="www.esempio.com o https://esempio.com"
              />
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
                💡 Puoi inserire l'URL con o senza https:// (verrà aggiunto automaticamente se necessario)
              </p>
            </div>
          )}

          {/* Selezione Notizia */}
          {formData.resource_type === 'news' && (
            <div className="form-group">
              <label className="form-label">
                <Newspaper size={20} />
                Seleziona una Notizia
              </label>
              <select
                className="form-input"
                value={formData.resource_news_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, resource_news_id: e.target.value ? parseInt(e.target.value) : undefined }))}
              >
                <option value="">-- Seleziona una notizia --</option>
                {newsList.map((news: any) => (
                  <option key={news.id} value={news.id}>
                    {news.title || news.headline || `News ${news.id}`}
                  </option>
                ))}
              </select>
              {newsList.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Nessuna notizia disponibile
                </p>
              )}
            </div>
          )}

          {/* Anteprima Immagine */}
          {formData.resource_type === 'image' && (
            <div className="form-group">
              {uploadingImage ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Upload size={48} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#6366f1' }}>Caricamento in corso...</p>
                </div>
              ) : imagePreview ? (
                <div>
                  <label className="form-label">
                    <ImageIcon size={20} />
                    Anteprima Immagine
                  </label>
                  <div style={{ 
                    position: 'relative',
                    maxWidth: '400px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ width: '100%', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, resource_type: 'none', resource_url: undefined }));
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <ImageIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                    Clicca sul pulsante "Immagine" per caricare un'immagine
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 3: Tipo di Domanda e Opzioni */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#0f172a',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            ❓ Tipo di Domanda e Opzioni
          </h2>
          
          {/* Tipo Domanda */}
          <div className="form-group">
            <label className="form-label">
              <Settings size={20} />
              Tipo di Domanda *
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              marginTop: '0.5rem'
            }}>
              {questionTypeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    question_type: option.value 
                  }))}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `2px solid ${formData.question_type === option.value ? option.color : '#e2e8f0'}`,
                    background: formData.question_type === option.value ? option.color : 'white',
                    color: formData.question_type === option.value ? 'white' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s',
                    flex: '1 1 auto',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.question_type !== option.value) {
                      e.currentTarget.style.borderColor = option.color + '80';
                      e.currentTarget.style.background = option.color + '10';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.question_type !== option.value) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opzioni Rating */}
          {showRatingOptions && (
            <div className="form-group">
              <label className="form-label">
                <Star size={20} />
                Icona Rating
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { value: 'star', label: 'Stelle', icon: <Star size={24} /> },
                  { value: 'heart', label: 'Cuori', icon: <Heart size={24} /> },
                  { value: 'number', label: 'Numeri', icon: <Hash size={24} /> }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating_icon: option.value as any }))}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      border: `2px solid ${formData.rating_icon === option.value ? '#6366f1' : '#e2e8f0'}`,
                      background: formData.rating_icon === option.value ? '#6366f1' : 'white',
                      color: formData.rating_icon === option.value ? 'white' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scala Min/Max */}
          {(showScaleOptions || showRatingOptions) && (
            <div className="form-group">
              <label className="form-label">
                <Settings size={20} />
                Intervallo {showRatingOptions ? 'Rating' : 'Scala'}
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>
                    Min
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.min_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_value: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={formData.max_value ? formData.max_value - 1 : 10}
                    style={{ margin: 0 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>
                    Max
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.max_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_value: parseInt(e.target.value) || 5 }))}
                    min={formData.min_value ? formData.min_value + 1 : 2}
                    max={10}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Label scala */}
          {showScaleOptions && (
            <div className="form-group">
              <label className="form-label">
                Etichette Scala (opzionale)
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.scale_min_label || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scale_min_label: e.target.value }))}
                  placeholder="Es: Molto insoddisfatto"
                  style={{ flex: 1, margin: 0 }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={formData.scale_max_label || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scale_max_label: e.target.value }))}
                  placeholder="Es: Molto soddisfatto"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>
            </div>
          )}

          {/* Opzioni di Risposta */}
          {showOptions && (
            <div className="form-group">
              <label className="form-label">
                <PlusCircle size={20} />
                {getOptionsLabel()}
                {[QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE].includes(formData.question_type) && ' *'}
              </label>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#64748b', 
                marginBottom: '1rem',
                marginTop: '-0.5rem'
              }}>
                {getOptionsHelp()}
              </p>
              {formData.options.map((option, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  marginBottom: '1rem', 
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ 
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: '#6366f1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500',
                    fontSize: '0.8125rem'
                  }}>
                    {index + 1}
                  </span>
                  <input
                    type={formData.question_type === QuestionType.DATE ? 'date' : 'text'}
                    className="form-input"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={formData.question_type === QuestionType.DATE ? '' : `Opzione ${index + 1}`}
                    style={{ flex: 1, margin: 0 }}
                  />
                  {/* Mostra pulsante rimozione se ci sono più opzioni del minimo richiesto per quel tipo di domanda */}
                  {formData.options.length > ([QuestionType.RATING, QuestionType.SCALE, QuestionType.OPEN_TEXT].includes(formData.question_type) ? 1 : 2) && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '0.625rem',
                        minWidth: 'auto',
                        aspectRatio: '1/1'
                      }}
                      title="Rimuovi opzione"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '0.75rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={addOption}
                  className="btn btn-secondary"
                  style={{ flex: '1 1 auto', minWidth: '200px' }}
                >
                  <PlusCircle size={18} />
                  Aggiungi Opzione
                </button>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: '0.625rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  flex: '1 1 auto',
                  minWidth: '250px'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.allow_custom_options || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_custom_options: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                  />
                  <span style={{ fontWeight: '500' }}>Permetti opzioni personalizzate</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: Modalità di Chiusura */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#0f172a',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            📅 Modalità di Chiusura Sondaggio
          </h2>
          
          {/* Tipo di Chiusura Sondaggio */}
          <div className="form-group">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, closure_type: ClosureType.PERMANENT }))}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: formData.closure_type === ClosureType.PERMANENT ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '8px',
                  background: formData.closure_type === ClosureType.PERMANENT ? '#eff6ff' : 'white',
                  color: formData.closure_type === ClosureType.PERMANENT ? '#1e40af' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '600',
                  fontSize: '0.9375rem'
                }}
              >
                Permanente
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, closure_type: ClosureType.SCHEDULED }))}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: formData.closure_type === ClosureType.SCHEDULED ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '8px',
                  background: formData.closure_type === ClosureType.SCHEDULED ? '#eff6ff' : 'white',
                  color: formData.closure_type === ClosureType.SCHEDULED ? '#1e40af' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '600',
                  fontSize: '0.9375rem'
                }}
              >
                Scadenza fissata
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, closure_type: ClosureType.MANUAL }))}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: formData.closure_type === ClosureType.MANUAL ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '8px',
                  background: formData.closure_type === ClosureType.MANUAL ? '#eff6ff' : 'white',
                  color: formData.closure_type === ClosureType.MANUAL ? '#1e40af' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '600',
                  fontSize: '0.9375rem'
                }}
              >
                Chiusura libera
              </button>
            </div>

            {/* Descrizioni */}
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>
              {formData.closure_type === ClosureType.PERMANENT && '✓ Il sondaggio sarà sempre attivo e accetterà voti in modo continuativo'}
              {formData.closure_type === ClosureType.SCHEDULED && '📅 Il sondaggio si chiuderà automaticamente alla data e ora impostate'}
              {formData.closure_type === ClosureType.MANUAL && '✋ Potrai chiudere manualmente il sondaggio quando lo desideri'}
            </p>

            {/* Checkbox risultati alla chiusura - visibile solo per SCHEDULED e MANUAL */}
            {(formData.closure_type === ClosureType.SCHEDULED || formData.closure_type === ClosureType.MANUAL) && (
              <div style={{ 
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#f8fafc'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.show_results_on_close}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_results_on_close: e.target.checked }))}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: '600', 
                      color: '#0f172a',
                      marginBottom: '0.25rem'
                    }}>
                      Risultati alla chiusura
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: '1.4' }}>
                      I risultati saranno visibili solo dopo la chiusura del sondaggio. Gli utenti che votano verranno reindirizzati alle statistiche.
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Data e ora - visibili solo se SCHEDULED */}
            {formData.closure_type === ClosureType.SCHEDULED && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8125rem', 
                    color: '#64748b', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Data *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8125rem', 
                    color: '#64748b', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Orario (opzionale)
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: Tag e Categorie */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#0f172a',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            🏷️ Tag e Categorie
          </h2>
          
          {/* Tag */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Tag e Categorie (opzionale)
            </label>
            <TagManager
              selectedTagIds={formData.tag_ids || []}
              onChange={(tagIds) => setFormData(prev => ({ ...prev, tag_ids: tagIds }))}
            />
          </div>
        </div>

        {/* Pulsanti */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem'
        }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            <Save size={18} />
            {loading ? 'Creazione...' : 'Crea Sondaggio'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/surveys')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={18} />
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
