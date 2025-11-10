import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon } from 'lucide-react';
import { surveyApi } from '../services/api';

const SettingsUrl: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const setting = await surveyApi.getSetting('qr_code_url');
      setQrUrl(setting.value);
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!qrUrl.trim()) {
      alert('L\'URL non può essere vuoto');
      return;
    }

    try {
      setSaving(true);
      await surveyApi.updateSetting('qr_code_url', qrUrl);
      setSuccessMessage('URL salvato con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Errore nel salvare l\'URL:', error);
      alert('Errore nel salvataggio dell\'URL');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LinkIcon size={32} />
        Gestione URL
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Configura l'URL base per i codici QR dei sondaggi
      </p>

      {successMessage && (
        <div className="success" style={{ marginBottom: '1.5rem' }}>
          {successMessage}
        </div>
      )}

      <div className="card">
        <div className="form-group">
          <label className="form-label">
            URL Base per QR Code
          </label>
          <input
            type="text"
            className="form-input"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            Questo URL verrà usato come base per generare i codici QR dei sondaggi.
            I sondaggi saranno accessibili all'indirizzo: {qrUrl}/survey/[ID]
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <Save size={18} />
          {saving ? 'Salvataggio...' : 'Salva URL'}
        </button>
      </div>
    </div>
  );
};

export default SettingsUrl;

