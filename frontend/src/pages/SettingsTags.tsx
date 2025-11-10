import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Edit, Check, X, Power, PowerOff } from 'lucide-react';
import { Tag } from '../types';

const SettingsTags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Stato per la creazione di un nuovo tag
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  
  // Stato per la modifica di un tag
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      // Includi anche i tag disattivati per la gestione admin
      const response = await fetch('/tags?include_inactive=true');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        setErrorMessage('Errore nel caricamento dei tag');
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tag:', error);
      setErrorMessage('Errore nel caricamento dei tag');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setErrorMessage('Il nome del tag non può essere vuoto');
      return;
    }

    try {
      const response = await fetch('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTagName.trim(),
          color: newTagColor 
        })
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        setSuccessMessage(`✅ Tag "${newTag.name}" creato con successo!`);
        setNewTagName('');
        setNewTagColor('#6366f1');
        setIsCreating(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Errore nella creazione del tag');
      }
    } catch (error) {
      console.error('Errore nella creazione del tag:', error);
      setErrorMessage('Errore nella creazione del tag');
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setEditingTagColor(tag.color);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
    setEditingTagColor('');
  };

  const handleSaveEdit = async (tagId: number) => {
    if (!editingTagName.trim()) {
      setErrorMessage('Il nome del tag non può essere vuoto');
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTagName.trim(),
          color: editingTagColor
        })
      });

      if (response.ok) {
        const updatedTag = await response.json();
        setTags(tags.map(t => t.id === tagId ? updatedTag : t));
        setSuccessMessage(`✅ Tag aggiornato con successo!`);
        setEditingTagId(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Errore nell\'aggiornamento del tag');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del tag:', error);
      setErrorMessage('Errore nell\'aggiornamento del tag');
    }
  };

  const handleToggleActive = async (tag: Tag) => {
    const action = tag.is_active ? 'disattivare' : 'riattivare';
    if (!window.confirm(`Sei sicuro di voler ${action} il tag "${tag.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tag.id}/toggle`, {
        method: 'PUT'
      });

      if (response.ok) {
        const updatedTag = await response.json();
        setTags(tags.map(t => t.id === tag.id ? updatedTag : t));
        setSuccessMessage(`✅ Tag "${updatedTag.name}" ${updatedTag.is_active ? 'riattivato' : 'disattivato'} con successo!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Errore nell\'attivazione/disattivazione del tag');
      }
    } catch (error) {
      console.error('Errore nell\'attivazione/disattivazione del tag:', error);
      setErrorMessage('Errore nell\'attivazione/disattivazione del tag');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento tag...</div>;
  }

  const activeTags = tags.filter(t => t.is_active);
  const inactiveTags = tags.filter(t => !t.is_active);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <TagIcon size={32} />
        Gestione Tags
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Crea, modifica e gestisci i tag per categorizzare i sondaggi
      </p>

      {errorMessage && (
        <div className="error" style={{ marginBottom: '1.5rem' }}>
          <X size={20} /> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="success" style={{ marginBottom: '1.5rem' }}>
          {successMessage}
        </div>
      )}

      {/* Pulsante Crea Nuovo Tag */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
          style={{ marginBottom: '2rem', width: '100%' }}
        >
          <Plus size={20} />
          Crea Nuovo Tag
        </button>
      )}

      {/* Form Creazione Tag */}
      {isCreating && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f0fdf4', border: '2px solid #22c55e' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
            Nuovo Tag
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nome Tag</label>
              <input
                type="text"
                className="form-input"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="es. Politica, Ambiente, Sport..."
                autoFocus
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Colore</label>
              <input
                type="color"
                className="form-input"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                style={{ width: '80px', height: '42px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCreateTag} className="btn btn-success">
                <Check size={18} /> Salva
              </button>
              <button onClick={() => { setIsCreating(false); setNewTagName(''); setNewTagColor('#6366f1'); }} className="btn btn-secondary">
                <X size={18} /> Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Attivi */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600', color: '#059669' }}>
          ✅ Tag Attivi ({activeTags.length})
        </h2>
        {activeTags.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>
            Nessun tag attivo. Crea il primo tag!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeTags.map(tag => (
              <div
                key={tag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {editingTagId === tag.id ? (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      value={editingTagName}
                      onChange={(e) => setEditingTagName(e.target.value)}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <input
                      type="color"
                      className="form-input"
                      value={editingTagColor}
                      onChange={(e) => setEditingTagColor(e.target.value)}
                      style={{ width: '60px', height: '38px', cursor: 'pointer', margin: 0 }}
                    />
                    <button onClick={() => handleSaveEdit(tag.id)} className="btn btn-success" style={{ padding: '0.5rem 1rem' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: tag.color,
                        flexShrink: 0
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '1rem', fontWeight: '500' }}>
                      {tag.name}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      {tag.color}
                    </span>
                    <button
                      onClick={() => handleStartEdit(tag)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Edit size={16} /> Modifica
                    </button>
                    <button
                      onClick={() => handleToggleActive(tag)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <PowerOff size={16} /> Disattiva
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags Disattivati */}
      {inactiveTags.length > 0 && (
        <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600', color: '#dc2626' }}>
            ⚠️ Tag Disattivati ({inactiveTags.length})
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1rem' }}>
            I tag disattivati non sono disponibili per il tagging dei sondaggi, ma possono essere riattivati in qualsiasi momento.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {inactiveTags.map(tag => (
              <div
                key={tag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecaca',
                  opacity: 0.7
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: tag.color,
                    flexShrink: 0
                  }}
                />
                <span style={{ flex: 1, fontSize: '1rem', fontWeight: '500', textDecoration: 'line-through' }}>
                  {tag.name}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  {tag.color}
                </span>
                <button
                  onClick={() => handleToggleActive(tag)}
                  className="btn btn-success"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <Power size={16} /> Riattiva
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTags;

