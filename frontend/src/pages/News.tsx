import React from 'react';
import { Newspaper, Calendar, User } from 'lucide-react';

const News: React.FC = () => {
  // Dati di esempio per le notizie
  const newsItems = [
    {
      id: 1,
      title: 'Nuova funzionalità: Sondaggi Anonimi',
      date: '14 Novembre 2025',
      author: 'Team Web Democracy',
      excerpt: 'Abbiamo introdotto la possibilità di creare sondaggi completamente anonimi per garantire la massima privacy dei partecipanti.',
      content: 'I sondaggi anonimi permettono di raccogliere feedback senza registrare l\'identità degli utenti. Questa funzionalità è ideale per sondaggi sensibili o quando si vuole garantire la massima libertà di espressione.'
    },
    {
      id: 2,
      title: 'Miglioramenti all\'interfaccia utente',
      date: '10 Novembre 2025',
      author: 'Team Design',
      excerpt: 'Abbiamo rinnovato l\'interfaccia con nuovi filtri e una migliore esperienza di navigazione.',
      content: 'La nuova sidebar con filtri avanzati permette di trovare rapidamente i sondaggi di interesse. Abbiamo anche migliorato la visualizzazione su dispositivi mobili.'
    },
    {
      id: 3,
      title: 'Web Democracy raggiunge 1000 utenti!',
      date: '5 Novembre 2025',
      author: 'Team Web Democracy',
      excerpt: 'Un traguardo importante per la nostra piattaforma di democrazia partecipativa.',
      content: 'Siamo orgogliosi di annunciare che la nostra community ha raggiunto i 1000 utenti attivi. Grazie a tutti per il vostro supporto e partecipazione!'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          color: '#0f172a',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Newspaper size={32} style={{ color: '#6366f1' }} />
          Notizie
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.9375rem'
        }}>
          Resta aggiornato sulle ultime novità di Web Democracy
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '1.5rem',
        maxWidth: '900px'
      }}>
        {newsItems.map((news) => (
          <div 
            key={news.id}
            className="card"
            style={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '0.75rem'
              }}>
                {news.title}
              </h2>
              
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} />
                  {news.date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} />
                  {news.author}
                </div>
              </div>

              <p style={{
                fontSize: '0.9375rem',
                color: '#475569',
                lineHeight: '1.6',
                marginBottom: '0.75rem'
              }}>
                {news.excerpt}
              </p>

              <p style={{
                fontSize: '0.9375rem',
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                {news.content}
              </p>
            </div>

            <div style={{
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                style={{
                  color: '#6366f1',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Leggi di più →
              </button>
            </div>
          </div>
        ))}
      </div>

      {newsItems.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Newspaper size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Non ci sono notizie al momento
          </p>
        </div>
      )}
    </div>
  );
};

export default News;





