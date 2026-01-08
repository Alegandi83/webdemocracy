import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { surveyApi } from '../services/api';

const SettingsUrl: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrText, setQrText] = useState<string>('');
  const [sponsorQrUrl, setSponsorQrUrl] = useState<string>('');
  const [sponsorQrText, setSponsorQrText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingHome, setSavingHome] = useState(false);
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [resettingHome, setResettingHome] = useState(false);
  const [successMessageHome, setSuccessMessageHome] = useState('');
  const [successMessageSponsor, setSuccessMessageSponsor] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const homeUrlSetting = await surveyApi.getSetting('qr_code_url');
      setQrUrl(homeUrlSetting.value);
      
      // Carica il testo descrittivo per la pagina home
      try {
        const homeTextSetting = await surveyApi.getSetting('qr_code_text');
        setQrText(homeTextSetting.value || '');
      } catch (error) {
        // Se non esiste ancora, usa un valore di default
        setQrText('');
      }
      
      // Carica anche l'URL per la pagina sponsor
      try {
        const sponsorUrlSetting = await surveyApi.getSetting('sponsor_qr_code_url');
        setSponsorQrUrl(sponsorUrlSetting.value);
      } catch (error) {
        // Se non esiste ancora, usa un valore di default
        setSponsorQrUrl('https://example.com/sponsor');
      }
      
      // Carica il testo descrittivo per la pagina sponsor
      try {
        const sponsorTextSetting = await surveyApi.getSetting('sponsor_qr_code_text');
        setSponsorQrText(sponsorTextSetting.value || '');
      } catch (error) {
        // Se non esiste ancora, usa un valore di default
        setSponsorQrText('');
      }
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHome = async () => {
    if (!qrUrl.trim()) {
      alert('L\'URL non può essere vuoto');
      return;
    }

    try {
      setSavingHome(true);
      // Salva l'URL
      await surveyApi.updateSetting('qr_code_url', qrUrl);
      // Salva il testo descrittivo (anche se vuoto)
      await surveyApi.updateSetting('qr_code_text', qrText.trim());
      setSuccessMessageHome('Impostazioni Home salvate con successo!');
      setTimeout(() => setSuccessMessageHome(''), 3000);
    } catch (error) {
      console.error('Errore nel salvare le impostazioni Home:', error);
      alert('Errore nel salvataggio delle impostazioni Home');
    } finally {
      setSavingHome(false);
    }
  };

  const handleResetHome = async () => {
    if (!window.confirm('Vuoi resettare l\'URL al valore di default (DATABRICKS_APP_URL)?')) {
      return;
    }

    try {
      setResettingHome(true);
      // Reset al valore di default
      const result = await surveyApi.resetSetting('qr_code_url');
      setQrUrl(result.value);
      setSuccessMessageHome(`URL resettato al valore di default: ${result.value}`);
      setTimeout(() => setSuccessMessageHome(''), 5000);
    } catch (error) {
      console.error('Errore nel reset delle impostazioni Home:', error);
      alert('Errore nel reset delle impostazioni Home');
    } finally {
      setResettingHome(false);
    }
  };

  const handleSaveSponsor = async () => {
    if (!sponsorQrUrl.trim()) {
      alert('L\'URL non può essere vuoto');
      return;
    }

    try {
      setSavingSponsor(true);
      // Salva l'URL
      await surveyApi.updateSetting('sponsor_qr_code_url', sponsorQrUrl);
      // Salva il testo descrittivo (anche se vuoto)
      await surveyApi.updateSetting('sponsor_qr_code_text', sponsorQrText.trim());
      setSuccessMessageSponsor('Impostazioni Sponsor salvate con successo!');
      setTimeout(() => setSuccessMessageSponsor(''), 3000);
    } catch (error) {
      console.error('Errore nel salvare le impostazioni Sponsor:', error);
      alert('Errore nel salvataggio delle impostazioni Sponsor');
    } finally {
      setSavingSponsor(false);
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
        Configura gli URL per i codici QR delle pagine
      </p>

      {/* Card URL Home */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        {successMessageHome && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            {successMessageHome}
        </div>
      )}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            URL per QR Code - Pagina Home
          </label>
          <input
            type="text"
            className="form-input"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', marginBottom: 0 }}>
            URL codificato nel QR Code della pagina Home
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Testo descrittivo sotto il QR Code
          </label>
          <input
            type="text"
            className="form-input"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="Scannerizza il QR Code per accedere"
          />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', marginBottom: 0 }}>
            Testo mostrato sotto il QR Code. Se vuoto, verrà mostrato l'URL
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSaveHome}
            disabled={savingHome || resettingHome}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <Save size={18} />
            {savingHome ? 'Salvataggio...' : 'Salva Home'}
          </button>
          <button
            onClick={handleResetHome}
            disabled={savingHome || resettingHome}
            className="btn"
            style={{ 
              flex: '0 0 auto',
              background: 'var(--surface-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)'
            }}
            title="Reset al valore di default (DATABRICKS_APP_URL)"
          >
            <RotateCcw size={18} />
            {resettingHome ? 'Reset...' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Card URL Sponsor */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {successMessageSponsor && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            {successMessageSponsor}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            URL per QR Code - Pagina Sponsor
          </label>
          <input
            type="text"
            className="form-input"
            value={sponsorQrUrl}
            onChange={(e) => setSponsorQrUrl(e.target.value)}
            placeholder="https://example.com/sponsor"
          />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', marginBottom: 0 }}>
            URL codificato nel QR Code della pagina Sponsor
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Testo descrittivo sotto il QR Code
          </label>
          <input
            type="text"
            className="form-input"
            value={sponsorQrText}
            onChange={(e) => setSponsorQrText(e.target.value)}
            placeholder="Scannerizza il QR Code per maggiori informazioni"
          />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', marginBottom: 0 }}>
            Testo mostrato sotto il QR Code. Se vuoto, verrà mostrato l'URL
          </p>
        </div>

        <button
          onClick={handleSaveSponsor}
          disabled={savingSponsor}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <Save size={18} />
          {savingSponsor ? 'Salvataggio...' : 'Salva Sponsor'}
        </button>
      </div>
    </div>
  );
};

export default SettingsUrl;

