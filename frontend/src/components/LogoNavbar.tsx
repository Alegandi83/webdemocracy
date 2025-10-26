// 🎯 Esempio pratico: Logo nella Navbar
// Componente pronto da usare per sostituire l'emoji nella navbar

import React from 'react';
import { Link } from 'react-router-dom';

// Percorsi dei loghi (ora funzionanti)
const LOGOS = {
  small: '/assets/logos/variants/logo-small.svg',
  icon: '/assets/logos/variants/logo-icon.svg',
  primary: '/assets/logos/primary/logo.svg'
};

interface LogoNavbarProps {
  showText?: boolean;
  logoType?: 'small' | 'icon' | 'primary';
  style?: React.CSSProperties;
}

const LogoNavbar: React.FC<LogoNavbarProps> = ({ 
  showText = true, 
  logoType = 'small',
  style 
}) => {
  const logoHeight = logoType === 'icon' ? '24px' : logoType === 'small' ? '30px' : '40px';

  return (
    <Link 
      to="/" 
      className="nav-brand" 
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        ...style 
      }}
    >
      <img 
        src={LOGOS[logoType]} 
        alt="Web Democracy Logo" 
        style={{ 
          height: logoHeight,
          marginRight: showText ? '0.5rem' : '0'
        }}
      />
      {showText && <span>Web Democracy</span>}
    </Link>
  );
};

// Versione solo logo (per spazi ristretti)
export const LogoOnly: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <img 
    src={LOGOS.icon} 
    alt="Web Democracy" 
    style={{ width: size, height: size }}
  />
);

// Versione con testo personalizzato
export const LogoWithCustomText: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img 
      src={LOGOS.small} 
      alt="Web Democracy Logo" 
      style={{ height: '28px', marginRight: '0.5rem' }}
    />
    <span>{text}</span>
  </div>
);

export default LogoNavbar;

/**
 * 📖 UTILIZZO NEL FILE App.tsx:
 * 
 * // Importa il componente
 * import LogoNavbar from './components/LogoNavbar';
 * 
 * // Sostituisci questa riga:
 * <Link to="/" className="nav-brand">📊 Web Democracy</Link>
 * 
 * // Con questa:
 * <LogoNavbar />
 * 
 * // Oppure personalizzata:
 * <LogoNavbar logoType="small" showText={true} />
 */
