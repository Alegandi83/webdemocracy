import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { surveyApi } from '../services/api';
import githubEmblem from '../assets/logos/others/github-emblem.png';

const Home: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('https://example.com');
  const [qrText, setQrText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQrUrl();
  }, []);

  const loadQrUrl = async () => {
    try {
      const setting = await surveyApi.getSetting('qr_code_url');
      setQrUrl(setting.value);
      
      // Carica il testo descrittivo
      try {
        const textSetting = await surveyApi.getSetting('qr_code_text');
        setQrText(textSetting.value || '');
      } catch (textError) {
        console.error('Errore nel caricamento del testo home:', textError);
        // Se il testo non esiste, lascia vuoto (verrà mostrato l'URL)
        setQrText('');
      }
    } catch (error) {
      console.error('Errore nel caricamento dell\'URL:', error);
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
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '0 2rem 4rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        width: '100%',
        alignItems: 'stretch'
      }}>
        
        {/* Card Sinistra - Loghi Partners */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2.5rem'
        }}>
          
          {/* GitHub e Web Democracy */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 0',
              width: '100%'
            }}
          >
            <div
              onClick={() => window.open('https://github.com/Alegandi83/webdemocracy', '_blank')}
              style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s',
                borderRadius: '8px',
                padding: '0 1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              {/* Logo GitHub */}
              <img 
                src={githubEmblem}
                alt="GitHub" 
                style={{ 
                  height: '58px',
                  width: '58px',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              
              {/* Logo Web Democracy */}
            <img 
              src="/assets/logos/primary/logo.svg" 
              alt="Web Democracy" 
              style={{ 
                  height: '68px',
                objectFit: 'contain'
              }}
            />
            </div>
          </div>

          {/* Separatore */}
          <div style={{
            width: '85%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)',
            margin: '0 auto'
          }} />

          {/* Logo Databricks */}
          <div 
            onClick={() => window.open('https://www.databricks.com/', '_blank')}
            style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
              padding: '1rem 0',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              const img = e.currentTarget.querySelector('img');
              if (img) (img as HTMLImageElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              const img = e.currentTarget.querySelector('img');
              if (img) (img as HTMLImageElement).style.opacity = '0.85';
            }}
          >
            <img 
              src="/assets/logos/partners/databricks-logo.png" 
              alt="Databricks Partner" 
              style={{ 
                height: '50px',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: 0.85,
                transition: 'opacity 0.2s'
              }}
            />
          </div>

          {/* Separatore */}
          <div style={{
            width: '85%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)',
            margin: '0 auto'
          }} />

          {/* Logo TeamSystem */}
          <div 
            onClick={() => navigate('/sponsor')}
            style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
              padding: '1rem 0',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              const img = e.currentTarget.querySelector('img');
              if (img) (img as HTMLImageElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              const img = e.currentTarget.querySelector('img');
              if (img) (img as HTMLImageElement).style.opacity = '0.85';
            }}
          >
            <img 
              src="/assets/logos/partners/teamsystem-logo.png" 
              alt="TeamSystem Partner" 
              style={{ 
                height: '90px',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: 0.85,
                transition: 'opacity 0.2s'
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

export default Home;

