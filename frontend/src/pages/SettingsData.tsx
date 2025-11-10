import React, { useState } from 'react';
import { Database, Trash2, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

const SettingsData: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleDeleteAllSurveys = async () => {
    if (!window.confirm('⚠️ ATTENZIONE!\n\nStai per eliminare TUTTI i sondaggi, le opzioni e i voti.\n\nQuesta azione NON può essere annullata!\n\nSei sicuro di voler procedere?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch('/api/surveys/all', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert('Errore nell\'eliminazione dei sondaggi');
      }
    } catch (error) {
      console.error('Errore nell\'eliminare i sondaggi:', error);
      alert('Errore nell\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTestData = async () => {
    if (!window.confirm('Creare 6 sondaggi di test (uno per ogni tipologia)?\n\n- Scelta Singola\n- Scelta Multipla\n- Testo Aperto\n- Scala (1-10)\n- Rating (1-5 stelle)\n- Data')) {
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/surveys/test-data', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message + '\n\nSondaggi creati:\n' + data.surveys.join('\n'));
        setTimeout(() => setSuccessMessage(''), 7000);
      } else {
        alert('Errore nella creazione dei dati di test');
      }
    } catch (error) {
      console.error('Errore nella creazione dati di test:', error);
      alert('Errore nella creazione');
    } finally {
      setCreating(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('⚠️⚠️⚠️ ATTENZIONE MASSIMA! ⚠️⚠️⚠️\n\nStai per RESETTARE COMPLETAMENTE il database!\n\nQuesta azione:\n• Eliminerà TUTTI i dati (sondaggi, voti, utenti, tag, settings)\n• Ricreerà lo schema con le tabelle aggiornate\n• Inserirà solo i dati di default (tag e utenti base)\n\nQuesta azione NON può essere annullata!\n\nSei ASSOLUTAMENTE SICURO di voler procedere?')) {
      return;
    }

    if (!window.confirm('ULTIMA CONFERMA: Sei sicuro di voler resettare il database?\n\nDigita OK se vuoi procedere.')) {
      return;
    }

    try {
      setResetting(true);
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('✅ ' + data.message + '\n\n' + data.details + '\n\nRicarica la pagina per vedere i cambiamenti.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert('Errore nel reset del database: ' + (errorData.detail || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore nel reset del database:', error);
      alert('Errore nel reset del database');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Database size={32} />
        Gestione Dati
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Amministra i dati dei sondaggi del sistema
      </p>

      {successMessage && (
        <div className="success" style={{ marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
          {successMessage}
        </div>
      )}

      {/* Crea Dati di Test */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>
          Dati di Test
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Crea automaticamente un sondaggio di esempio per ogni tipologia disponibile nel sistema.
          Utile per testing e demo.
        </p>

        <div style={{ 
          padding: '1rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem'
        }}>
          <strong style={{ color: '#166534', display: 'block', marginBottom: '0.5rem' }}>
            Verranno creati 6 sondaggi:
          </strong>
          <ul style={{ marginLeft: '1.5rem', color: '#15803d', fontSize: '0.875rem' }}>
            <li>Scelta Singola (con 6 opzioni)</li>
            <li>Scelta Multipla (con 6 opzioni)</li>
            <li>Testo Aperto</li>
            <li>Scala numerica (1-10)</li>
            <li>Rating con stelle (1-5)</li>
            <li>Selezione data</li>
          </ul>
        </div>

        <button
          onClick={handleCreateTestData}
          disabled={creating}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          <Plus size={18} />
          {creating ? 'Creazione in corso...' : 'Crea Dati di Test'}
        </button>
      </div>

      {/* Zona Pericolosa */}
      <div className="card" style={{ 
        border: '2px solid #fecaca',
        background: '#fef2f2'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertTriangle size={24} style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '600', color: '#991b1b' }}>
            Zona Pericolosa
          </h2>
        </div>
        
        <p style={{ color: '#7f1d1d', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          L'eliminazione di tutti i sondaggi è un'azione <strong>irreversibile</strong> che cancellerà:
        </p>

        <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem', color: '#7f1d1d', fontSize: '0.875rem' }}>
          <li>Tutti i sondaggi</li>
          <li>Tutte le opzioni di risposta</li>
          <li>Tutti i voti registrati</li>
          <li>Tutte le risposte aperte</li>
          <li>Tutti i gradimenti (likes)</li>
        </ul>

        <div style={{
          padding: '0.75rem',
          background: '#fee2e2',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          border: '1px solid #fca5a5'
        }}>
          <strong style={{ color: '#991b1b', fontSize: '0.875rem' }}>
            ⚠️ ATTENZIONE: Non potrai recuperare questi dati!
          </strong>
        </div>

        <button
          onClick={handleDeleteAllSurveys}
          disabled={deleting}
          className="btn btn-danger"
          style={{ width: '100%' }}
        >
          <Trash2 size={18} />
          {deleting ? 'Eliminazione...' : 'Elimina TUTTI i Sondaggi'}
        </button>
      </div>

      {/* Reset Database Completo */}
      <div className="card" style={{ 
        border: '3px solid #7f1d1d',
        background: '#450a0a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <RefreshCw size={24} style={{ color: '#fca5a5' }} />
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '600', color: '#fca5a5' }}>
            ⚠️ Reset Database Completo (SOLO PER SVILUPPO)
          </h2>
        </div>
        
        <div style={{
          padding: '1rem',
          background: '#7f1d1d',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          border: '2px solid #991b1b'
        }}>
          <strong style={{ color: '#fecaca', fontSize: '0.9375rem', display: 'block', marginBottom: '0.5rem' }}>
            🔥 OPERAZIONE ESTREMAMENTE PERICOLOSA 🔥
          </strong>
          <p style={{ color: '#fecaca', fontSize: '0.875rem', margin: 0 }}>
            Questa funzione <strong>elimina TUTTO il database</strong> e lo ricrea da zero con le tabelle aggiornate.
            Utilizzare SOLO per:
          </p>
        </div>

        <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem' }}>
          <li>Aggiornare lo schema del database dopo modifiche strutturali</li>
          <li>Aggiungere nuove colonne a tabelle esistenti</li>
          <li>Ripristinare il database a uno stato pulito per testing</li>
        </ul>

        <div style={{
          padding: '0.75rem',
          background: '#7f1d1d',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          border: '1px solid #991b1b'
        }}>
          <strong style={{ color: '#fecaca', fontSize: '0.875rem' }}>
            ⚠️ ATTENZIONE: Eliminerà TUTTI i dati, utenti, tag, settings e sondaggi!
          </strong>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={resetting}
          className="btn"
          style={{ 
            width: '100%',
            background: '#7f1d1d',
            color: '#fecaca',
            border: '2px solid #991b1b',
            fontWeight: '700'
          }}
        >
          <RefreshCw size={18} />
          {resetting ? 'Reset in corso...' : '🔥 RESET COMPLETO DATABASE 🔥'}
        </button>
      </div>
    </div>
  );
};

export default SettingsData;

