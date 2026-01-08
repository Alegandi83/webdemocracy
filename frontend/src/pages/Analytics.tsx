import React, { useEffect, useState } from 'react';
import { DatabricksDashboard } from '@databricks/aibi-client';

const Analytics: React.FC = () => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = () => {
      console.log('🚀 Inizializzazione dashboard Databricks...');
      
      const container = document.getElementById('dashboard-container');
      
      if (!container) {
        console.error('❌ Container non trovato');
        setSdkError('Container dashboard non trovato');
        return;
      }

      try {
        console.log('📊 Creazione istanza dashboard...');
        const dashboard = new DatabricksDashboard({
          instanceUrl: "https://dbc-52a679b2-d6e3.cloud.databricks.com",
          workspaceId: "870047418765792",
          dashboardId: "01f0c2d2b1e01f6cbbc5b52e84436845",
          token: "your-embedding-token-here",
          container: container,
        });
        
        console.log('✨ Inizializzazione...');
        dashboard.initialize();
        console.log('✅ Dashboard inizializzata con successo!');
        setSdkLoaded(true);
      } catch (err: any) {
        console.error('❌ Errore durante l\'inizializzazione:', err);
        
        // Verifica se è un errore di autenticazione
        const errorMessage = err?.message || String(err);
        if (errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('Credential')) {
          setSdkError('Token di autenticazione scaduto o non valido. Genera un nuovo embedding token dal workspace Databricks.');
        } else {
          setSdkError(`Errore: ${errorMessage}`);
        }
      }
    };

    // Attendi che il DOM sia pronto prima di inizializzare
    setTimeout(() => {
      initializeDashboard();
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      {/* Prima card: Dashboard iframe */}
      <div style={{ 
        marginBottom: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        background: 'white'
      }}>
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
            Dashboard Analytics (iframe)
          </h2>
        </div>
        <div style={{ height: '600px' }}>
          <iframe
            src="https://dbc-52a679b2-d6e3.cloud.databricks.com/embed/dashboardsv3/01f0c2d2b1e01f6cbbc5b52e84436845?o=870047418765792"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Analytics Dashboard Iframe"
          />
        </div>
      </div>

      {/* Seconda card: Dashboard JavaScript SDK */}
      <div style={{ 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        background: 'white'
      }}>
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
            Dashboard Interattiva (JavaScript SDK)
          </h2>
          {sdkLoaded && !sdkError && (
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#16a34a',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ✓ SDK Attivo
            </span>
          )}
        </div>
        <div 
          id="dashboard-container" 
          style={{ 
            height: '600px',
            width: '100%',
            position: 'relative',
            background: '#f8fafc'
          }}
        >
          {!sdkLoaded && !sdkError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
                Caricamento SDK Databricks...
              </p>
            </div>
          )}
          {sdkError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>⚠️</div>
              <p style={{ 
                color: '#dc2626', 
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Errore nel caricamento
              </p>
              <p style={{ 
                color: '#64748b', 
                fontSize: '0.875rem',
                maxWidth: '400px'
              }}>
                {sdkError}
              </p>
              <p style={{ 
                color: '#64748b', 
                fontSize: '0.75rem',
                marginTop: '1rem'
              }}>
                Controlla la console del browser per maggiori dettagli
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
