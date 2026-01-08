import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { surveyApi } from '../services/api';
import sponsorPoster from '../assets/logos/sponsors/sponsor-poster.jpeg';

const Sponsor: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('https://example.com');
  const [qrText, setQrText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQrUrl();
    
    // Rendi l'header cliccabile per tornare alla Home
    const nav = document.querySelector('nav');
    if (nav) {
      (nav as HTMLElement).style.cursor = 'pointer';
      const clickHandler = () => navigate('/');
      nav.addEventListener('click', clickHandler);
      
      // Cleanup: rimuovi l'event listener quando il componente viene smontato
      return () => {
        nav.removeEventListener('click', clickHandler);
        (nav as HTMLElement).style.cursor = '';
      };
    }
  }, [navigate]);

  const loadQrUrl = async () => {
    try {
      // Carica l'URL specifico per la pagina sponsor
      const setting = await surveyApi.getSetting('sponsor_qr_code_url');
      setQrUrl(setting.value);
      
      // Carica il testo descrittivo
      try {
        const textSetting = await surveyApi.getSetting('sponsor_qr_code_text');
        setQrText(textSetting.value || '');
      } catch (textError) {
        console.error('Errore nel caricamento del testo sponsor:', textError);
        // Se il testo non esiste, lascia vuoto (verrà mostrato l'URL)
        setQrText('');
      }
    } catch (error) {
      console.error('Errore nel caricamento dell\'URL sponsor:', error);
      // Se non esiste ancora, prova a usare l'URL principale come fallback
      try {
        const fallbackSetting = await surveyApi.getSetting('qr_code_url');
        setQrUrl(fallbackSetting.value);
        setQrText('');
      } catch (fallbackError) {
        console.error('Errore nel caricamento dell\'URL fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
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
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      paddingTop: '0',
      paddingBottom: '1rem',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        alignItems: 'stretch',
        maxHeight: '80vh'
      }}>
        
        {/* Card Sinistra - Sponsor Poster */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          
          {/* Immagine Sponsor Poster */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={sponsorPoster} 
              alt="Sponsor" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          </div>

        </div>

        {/* Card Destra - QR Code */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1.5rem',
          position: 'relative'
        }}>
          {/* QR Code */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}>
            <QRCodeSVG 
              value={qrUrl}
              size={undefined}
              level="H"
              includeMargin={false}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '100%'
              }}
            />
          </div>
          
          {/* Spazio flessibile per centrare il testo */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0 0.5rem'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '1rem',
              width: '100%'
            }}>
              <a 
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  margin: 0, 
                  fontWeight: '600', 
                  color: '#1e293b',
                  wordBreak: qrText && qrText.trim() !== '' ? 'break-word' : 'break-all',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s, opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6366f1';
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1e293b';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {qrText && qrText.trim() !== '' ? qrText : qrUrl}
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sponsor;

