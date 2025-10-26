import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, PlusCircle, X, Save, ArrowLeft, Calendar, Settings, Star, Heart, Hash, CheckCircle, CheckSquare, BarChart2, Type } from 'lucide-react';
import { surveyApi } from '../services/api';
import { SurveyCreate, QuestionType } from '../types';
import TagManager from '../components/TagManager';

const CreateSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyCreate>({
    title: '',
    description: '',
    question_type: QuestionType.SINGLE_CHOICE,
    options: ['', ''],
    tag_ids: [],
    allow_multiple_responses: false,
    allow_custom_options: false,
    require_comment: false,
    rating_icon: 'star',
    min_value: 1,
    max_value: 5
  });
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    // Per gli altri tipi, le opzioni sono opzionali ma se fornite devono essere almeno 2
    if (validOptions.length > 0 && validOptions.length < 2) {
      setError('Se inserisci delle opzioni, devi inserirne almeno 2');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const surveyToCreate: SurveyCreate = {
        ...formData,
        options: validOptions
      };
      
      // Combina data e orario se entrambi impostati
      if (expiryDate && expiryTime) {
        // Crea un oggetto Date locale e convertilo in ISO string
        const localDateTime = new Date(`${expiryDate}T${expiryTime}:00`);
        surveyToCreate.expires_at = localDateTime.toISOString();
      } else if (expiryDate) {
        // Se solo data, imposta a fine giornata
        const localDateTime = new Date(`${expiryDate}T23:59:00`);
        surveyToCreate.expires_at = localDateTime.toISOString();
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
    if (formData.options.length > 2) {
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
      
      <div className="card">
        <form onSubmit={handleSubmit}>
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
                  {formData.options.length > 2 && (
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
              
              <button
                type="button"
                onClick={addOption}
                className="btn btn-secondary"
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                <PlusCircle size={18} />
                Aggiungi Opzione
              </button>
            </div>
          )}

          {/* Scadenza */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={20} />
              Data di Scadenza (opzionale)
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8125rem', 
                  color: '#64748b', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Data
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
                  Orario
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
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
              Se impostata, il sondaggio non accetterà più voti dopo questa data e ora
            </p>
          </div>

          {/* Tag */}
          <div className="form-group">
            <label className="form-label">
              🏷️ Tag e Categorie (opzionale)
            </label>
            <TagManager
              selectedTagIds={formData.tag_ids || []}
              onChange={(tagIds) => setFormData(prev => ({ ...prev, tag_ids: tagIds }))}
            />
          </div>

          {/* Opzioni Avanzate */}
          <div className="form-group">
            <label className="form-label">
              <Settings size={20} />
              Opzioni Avanzate
            </label>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.9375rem'
              }}>
                <input
                  type="checkbox"
                  checked={formData.allow_custom_options || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_custom_options: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>
                  <strong>Permetti opzioni personalizzate</strong>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    {formData.question_type === QuestionType.SINGLE_CHOICE || formData.question_type === QuestionType.MULTIPLE_CHOICE
                      ? 'Gli utenti possono aggiungere nuove opzioni oltre a quelle esistenti'
                      : formData.question_type === QuestionType.DATE
                      ? 'Gli utenti possono proporre una data alternativa oltre a quelle proposte'
                      : formData.question_type === QuestionType.RATING || formData.question_type === QuestionType.SCALE
                      ? 'Gli utenti possono aggiungere nuove opzioni da valutare'
                      : formData.question_type === QuestionType.OPEN_TEXT
                      ? 'Gli utenti possono aggiungere nuovi campi di risposta'
                      : 'Gli utenti possono aggiungere nuove opzioni'}
                  </div>
                </span>
              </label>
            </div>
          </div>

          {/* Pulsanti */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0'
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
    </div>
  );
};

export default CreateSurvey;
