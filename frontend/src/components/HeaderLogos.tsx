// 🏢 Componente Header con loghi partner
import React from 'react';
import { LOGO_PATHS } from '../assets/logos/LogoUtils';

// Configurazione loghi per header
const HEADER_LOGOS = [
  {
    name: 'Web Democracy',
    src: LOGO_PATHS.small,
    alt: 'Web Democracy',
    height: '40px'
  },
  {
    name: 'Databricks',
    src: LOGO_PATHS.databricks,
    alt: 'Databricks Partner',
    height: '35px'
  },
  {
    name: 'TeamSystem',
    src: LOGO_PATHS.teamsystem,
    alt: 'TeamSystem Partner',
    height: '35px'
  }
] as const;

interface HeaderLogosProps {
  className?: string;
  style?: React.CSSProperties;
}

const HeaderLogos: React.FC<HeaderLogosProps> = ({ className, style }) => {
  return (
    <div 
      className={`header-logos ${className || ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '1rem 0',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        ...style
      }}
    >
      {HEADER_LOGOS.map((logo, index) => (
        <React.Fragment key={logo.name}>
          {index > 0 && (
            <div style={{
              width: '1px',
              height: '30px',
              backgroundColor: '#dee2e6'
            }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={logo.src} 
              alt={logo.alt} 
              title={logo.name}
              style={{ 
                height: logo.height,
                objectFit: 'contain',
                filter: 'none' // Mantieni colori originali
              }}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// Versione compatta per spazi ridotti
export const HeaderLogosCompact: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 0',
    justifyContent: 'center'
  }}>
    {HEADER_LOGOS.map((logo, index) => (
      <React.Fragment key={logo.name}>
        {index > 0 && <span style={{ color: '#dee2e6' }}>|</span>}
        <img 
          src={logo.src} 
          alt={logo.alt} 
          title={logo.name}
          style={{ 
            height: index === 0 ? '24px' : '20px', // Web Democracy leggermente più grande
            objectFit: 'contain'
          }} 
        />
      </React.Fragment>
    ))}
  </div>
);

// Hook per responsive
export const useHeaderSize = () => {
  const [isCompact, setIsCompact] = React.useState(false);

  React.useEffect(() => {
    const checkSize = () => setIsCompact(window.innerWidth < 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return isCompact;
};

// Componente responsive
export const ResponsiveHeaderLogos: React.FC = () => {
  const isCompact = useHeaderSize();
  
  return isCompact ? <HeaderLogosCompact /> : <HeaderLogos />;
};

export default HeaderLogos;
