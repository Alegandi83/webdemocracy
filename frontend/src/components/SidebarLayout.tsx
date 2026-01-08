import React, { ReactNode, useState } from 'react';
import { Filter, X } from 'lucide-react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarPosition?: 'left' | 'right';
  mobileToggleLabel?: string; // Label personalizzata per il pulsante mobile
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  sidebar, 
  children, 
  sidebarPosition = 'right',
  mobileToggleLabel = 'Mostra Filtri' // Default
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Determina il testo di chiusura basato sul label di apertura
  const getCloseLabel = (openLabel: string): string => {
    if (openLabel.toLowerCase().includes('filtri')) return 'Chiudi Filtri';
    if (openLabel.toLowerCase().includes('gradimento')) return 'Nascondi Gradimento';
    if (openLabel.toLowerCase().includes('commenti')) return 'Nascondi Commenti';
    return 'Chiudi';
  };

  return (
    <div className="survey-list-container">
      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-toggle" 
        onClick={toggleMobileFilters}
        aria-label="Toggle sidebar"
      >
        {mobileFiltersOpen ? (
          <>
            <X size={20} />
            {getCloseLabel(mobileToggleLabel)}
          </>
        ) : (
          <>
            <Filter size={20} />
            {mobileToggleLabel}
          </>
        )}
      </button>

      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'flex-start',
        flexDirection: sidebarPosition === 'left' ? 'row' : 'row-reverse'
      }}>
        {/* Contenuto principale */}
        <div style={{ 
          flex: 1,
          minWidth: 0
        }}>
          {children}
        </div>

        {/* Pannello laterale */}
        <div 
          className={`survey-filters ${mobileFiltersOpen ? 'mobile-open' : ''}`}
          style={{ 
            width: '320px',
            flexShrink: 0,
            position: 'sticky',
            top: '1rem'
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;

