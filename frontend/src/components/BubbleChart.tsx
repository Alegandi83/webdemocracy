import React from 'react';
import { Star, Heart, Circle } from 'lucide-react';

interface BubbleChartProps {
  data: {
    option_id?: number;
    option_text?: string;
    value_distribution?: {
      value: number;
      count: number;
    }[];
  }[];
  minValue: number;
  maxValue: number;
  ratingIcon?: string;
  userNumericVotes?: { [key: string]: number }; // Dict {option_id: numeric_value} - le chiavi JSON sono sempre stringhe
}

const BubbleChart: React.FC<BubbleChartProps> = ({ data, minValue, maxValue, ratingIcon = 'number', userNumericVotes }) => {
  // Calcola la dimensione massima dei voti per la scala delle bolle
  const maxCount = Math.max(
    ...data.flatMap(item => 
      item.value_distribution?.map(d => d.count) || [0]
    )
  );

  // Funzione per calcolare la dimensione della bolla
  const getBubbleSize = (count: number) => {
    if (count === 0) return 0;
    // Scala logaritmica per rendere le differenze più visibili
    const minSize = 20;
    const maxSize = 80;
    const scale = maxCount > 0 ? Math.sqrt(count / maxCount) : 0;
    return minSize + (maxSize - minSize) * scale;
  };

  // Funzione per renderizzare l'icona della bolla
  const renderBubbleIcon = (size: number, count: number) => {
    const iconSize = size * 0.6;
    const commonProps = {
      size: iconSize,
      strokeWidth: 2
    };

    if (ratingIcon === 'star') {
      return <Star {...commonProps} fill="#fbbf24" color="#f59e0b" />;
    } else if (ratingIcon === 'heart') {
      return <Heart {...commonProps} fill="#ec4899" color="#db2777" />;
    } else {
      return <Circle {...commonProps} fill="#6366f1" color="#4f46e5" />;
    }
  };

  // Range dei valori
  const values = Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem 1rem',
        minWidth: '600px'
      }}>
        {/* Asse X (valori di rating) - posizionato sopra */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr', // Label + grafico
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div /> {/* Spazio vuoto per allineamento con le label delle opzioni */}
          <div style={{
            position: 'relative',
            height: '30px'
          }}>
            {values.map((val, idx) => {
              const columnWidth = 100 / values.length;
              const labelPosition = (idx + 0.5) * columnWidth;
              return (
                <div
                  key={val}
                  style={{
                    position: 'absolute',
                    left: `${labelPosition}%`,
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>

        {/* Righe delle opzioni */}
        {data.map((item, optionIndex) => (
          <div
            key={optionIndex}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr', // Stessa struttura dell'asse X
              gap: '1rem',
              animation: 'fadeInUp 0.5s ease-out',
              animationDelay: `${optionIndex * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            {/* Label opzione (asse Y) */}
            <div style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#0f172a',
              textAlign: 'right',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              {item.option_text || 'Opzione'}
            </div>

            {/* Contenitore bolle */}
            <div style={{
              position: 'relative',
              height: '100px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {/* Linea guida orizzontale */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: '1px',
                background: '#cbd5e1',
                zIndex: 0
              }} />

              {/* Linee verticali della griglia - centrate su ogni colonna */}
              {values.map((val, idx) => {
                const columnWidth = 100 / values.length;
                const linePosition = (idx + 0.5) * columnWidth;
                return (
                  <div
                    key={`vline-${val}`}
                    style={{
                      position: 'absolute',
                      left: `${linePosition}%`,
                      width: '1px',
                      height: '100%',
                      background: '#e2e8f0',
                      zIndex: 0
                    }}
                  />
                );
              })}

              {/* Bolle */}
              {values.map((val, idx) => {
                const distributionItem = item.value_distribution?.find(d => d.value === val);
                const count = distributionItem?.count || 0;
                const size = getBubbleSize(count);
                const columnWidth = 100 / values.length;
                const bubblePosition = (idx + 0.5) * columnWidth;
                
                // Check se questa bolla rappresenta il voto dell'utente
                // Nota: le chiavi del dizionario JSON sono sempre stringhe
                const isUserVote = userNumericVotes && 
                                  item.option_id !== undefined && 
                                  userNumericVotes[item.option_id.toString()] === val;

                return (
                  <div
                    key={val}
                    style={{
                      position: 'absolute',
                      left: `${bubblePosition}%`,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1
                    }}
                  >
                    {count > 0 && (
                      <div
                        style={{
                          position: 'relative',
                          width: `${size}px`,
                          height: `${size}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title={`${count} ${count === 1 ? 'voto' : 'voti'} per valore ${val}`}
                      >
                        {renderBubbleIcon(size, count)}
                        
                        {/* Badge "Me" per il voto dell'utente */}
                        {isUserVote && (
                          <div style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '-12px',
                            background: '#6366f1',
                            color: 'white',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            border: '2px solid white',
                            zIndex: 20
                          }}>
                            {/* Speech bubble con "Me" */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                              <text x="12" y="13" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui, -apple-system">Me</text>
                            </svg>
                          </div>
                        )}
                        
                        {/* Numero di voti */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          background: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {count}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legenda */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            Legenda:
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: '#475569'
          }}>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>📊 Interpretazione:</div>
              <div>• Dimensione bolla = numero di voti</div>
              <div>• Posizione orizzontale = valore rating</div>
              <div>• Riga = opzione del sondaggio</div>
            </div>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>🎨 Icone:</div>
              {ratingIcon === 'star' && <div>⭐ Stella = valutazione</div>}
              {ratingIcon === 'heart' && <div>💗 Cuore = gradimento</div>}
              {ratingIcon === 'number' && <div>⚫ Cerchio = valore numerico</div>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BubbleChart;

