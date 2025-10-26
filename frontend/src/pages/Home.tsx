import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { surveyApi } from '../services/api';

const Home: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>('https://example.com');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQrUrl();
  }, []);

  const loadQrUrl = async () => {
    try {
      const setting = await surveyApi.getSetting('qr_code_url');
      setQrUrl(setting.value);
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

  const qrSize = Math.min(450, window.innerWidth * 0.4, window.innerHeight * 0.5);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '2rem 2rem 4rem',
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
          gap: '2.5rem',
          minHeight: qrSize + 80
        }}>
          
          {/* Logo Web Democracy */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 0'
          }}>
            <img 
              src="/assets/logos/primary/logo.svg" 
              alt="Web Democracy" 
              style={{ 
                height: '70px',
                maxWidth: '100%',
                objectFit: 'contain'
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

          {/* Logo Databricks */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 0'
          }}>
            <img 
              src="/assets/logos/partners/databricks-logo.png" 
              alt="Databricks Partner" 
              style={{ 
                height: '50px',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: 0.85
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 0'
          }}>
            <img 
              src="/assets/logos/partners/teamsystem-logo.png" 
              alt="TeamSystem Partner" 
              style={{ 
                height: '50px',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: 0.85
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
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2.5rem'
        }}>
          <QRCodeSVG 
            value={qrUrl}
            size={qrSize}
            level="H"
            includeMargin={true}
          />
          
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '1rem',
            maxWidth: '100%',
            padding: '0 1rem'
          }}>
            <p style={{ 
              margin: 0, 
              fontWeight: '600', 
              color: '#1e293b',
              wordBreak: 'break-all',
              fontSize: '1.125rem'
            }}>
              {qrUrl}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

