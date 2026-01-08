import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, X } from 'lucide-react';
import { Tag } from '../types';
import { surveyApi } from '../services/api';

interface TagManagerProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ selectedTagIds, onChange }) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await surveyApi.getTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Errore caricamento tag:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setLoading(true);
      const newTag = await surveyApi.createTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      setAllTags([...allTags, newTag]);
      setNewTagName('');
      setNewTagColor('#6366f1');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Errore creazione tag:', error);
      alert('Errore nella creazione del tag. Potrebbe già esistere.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const predefinedColors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#14b8a6', // teal
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {allTags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '6px',
              border: `2px solid ${tag.color}`,
              background: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
              color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
            onMouseEnter={(e) => {
              if (!selectedTagIds.includes(tag.id)) {
                e.currentTarget.style.background = `${tag.color}15`;
              }
            }}
            onMouseLeave={(e) => {
              if (!selectedTagIds.includes(tag.id)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <TagIcon size={14} />
            {tag.name}
          </button>
        ))}
      </div>

      {!showCreateForm ? (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          Crea Nuovo Tag
        </button>
      ) : (
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: '#475569',
                marginBottom: '0.375rem'
              }}>
                Nome Tag
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="es. Feedback"
                className="form-input"
                style={{ margin: 0 }}
                maxLength={50}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: '#475569',
                marginBottom: '0.375rem'
              }}>
                Colore
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: color,
                      border: newTagColor === color ? '3px solid #0f172a' : '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={loading || !newTagName.trim()}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              <TagIcon size={16} />
              {loading ? 'Creazione...' : 'Crea Tag'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTagName('');
                setNewTagColor('#6366f1');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              <X size={16} />
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;

