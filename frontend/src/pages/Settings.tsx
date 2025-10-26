import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, Trash2 } from 'lucide-react';
import { surveyApi } from '../services/api';

const Settings: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

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

    setSaving(true);
    setSuccessMessage('');
    
    try {
      await surveyApi.updateSetting('qr_code_url', qrUrl);
      setSuccessMessage('Impostazioni salvate con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllSurveys = async () => {
    const confirmed = window.confirm(
      'ATTENZIONE: Questa operazione cancellerà TUTTI i sondaggi e i relativi dati (voti, risposte, ecc.). ' +
      'Questa azione è IRREVERSIBILE. Sei sicuro di voler continuare?'
    );

    if (!confirmed) return;

    // Doppia conferma per operazione critica
    const doubleConfirm = window.confirm(
      'Conferma ancora una volta: vuoi davvero eliminare TUTTI i sondaggi? Non è possibile annullare questa operazione.'
    );

    if (!doubleConfirm) return;

    setDeleting(true);
    
    try {
      const result = await surveyApi.deleteAllSurveys();
      alert(`Operazione completata: ${result.message}`);
    } catch (error) {
      console.error('Errore nell\'eliminazione dei sondaggi:', error);
      alert('Errore nell\'eliminazione dei sondaggi');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div className="card">
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <LinkIcon size={24} />
            URL del QR Code
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="qr-url" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#475569'
              }}
            >
              URL di destinazione
            </label>
            <input
              id="qr-url"
              type="url"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <p style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#64748b' 
            }}>
              Inserisci l'URL completo (incluso https://) che verrà codificato nel QR code della home page.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: saving ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                if (!saving) e.currentTarget.style.background = '#3b82f6';
              }}
            >
              <Save size={20} />
              {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
            </button>

            {successMessage && (
              <span style={{
                color: '#10b981',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                ✓ {successMessage}
              </span>
            )}
          </div>
        </div>

        {/* Sezione pericolosa - Elimina tutti i sondaggi */}
        <div className="card" style={{ marginTop: '2rem', borderColor: '#ef4444' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Trash2 size={24} />
            Zona Pericolosa
          </h2>

          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fef2f2', 
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            <p style={{ 
              color: '#991b1b', 
              fontWeight: '500',
              marginBottom: '0.5rem' 
            }}>
              ⚠️ Attenzione: Azione irreversibile
            </p>
            <p style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>
              L'eliminazione di tutti i sondaggi rimuoverà permanentemente tutti i dati inclusi voti, 
              risposte, statistiche e gradimenti. Questa operazione non può essere annullata.
            </p>
          </div>

          <button
            onClick={handleDeleteAllSurveys}
            disabled={deleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: deleting ? '#fca5a5' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!deleting) e.currentTarget.style.background = '#dc2626';
            }}
            onMouseLeave={(e) => {
              if (!deleting) e.currentTarget.style.background = '#ef4444';
            }}
          >
            <Trash2 size={20} />
            {deleting ? 'Eliminazione in corso...' : 'Elimina Tutti i Sondaggi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

