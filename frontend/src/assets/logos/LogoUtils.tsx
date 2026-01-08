// 🛠️ Utility per gestire i loghi in modo compatibile con React
import React from 'react';

// Percorsi diretti ai loghi (serviti dalla cartella public)
export const LOGO_PATHS = {
  primary: '/assets/logos/primary/logo.svg',
  primaryTransparent: '/assets/logos/primary/logo-transparent.svg',
  small: '/assets/logos/variants/logo-small.svg',
  icon: '/assets/logos/variants/logo-icon.svg',
  // Loghi partner
  databricks: '/assets/logos/partners/databricks-logo.png',
  teamsystem: '/assets/logos/partners/teamsystem-logo.png'
} as const;

// Import dinamico per loghi (alternativa sicura)
export const getLogoUrl = (logoName: keyof typeof LOGO_PATHS): string => {
  return LOGO_PATHS[logoName];
};

// Componenti loghi preconfigurati
export const Logo: React.FC<{
  type: keyof typeof LOGO_PATHS;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ type, alt = "Web Democracy Logo", className, style }) => {
  return (
    <img
      src={getLogoUrl(type)}
      alt={alt}
      className={className}
      style={style}
    />
  );
};

// Componenti specifici per ogni logo
export const LogoPrimary: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties; 
}> = (props) => <Logo type="primary" {...props} />;

export const LogoSmall: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties; 
}> = (props) => <Logo type="small" {...props} />;

export const LogoIcon: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties; 
}> = (props) => <Logo type="icon" {...props} />;

// Hook per logo responsive
export const useResponsiveLogo = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? 'icon' : 'small';
};

// Esempio di utilizzo nella navbar
export const NavbarLogo: React.FC = () => {
  const logoType = useResponsiveLogo();
  
  return (
    <Logo 
      type={logoType}
      style={{ 
        height: logoType === 'icon' ? '24px' : '30px',
        marginRight: '0.5rem' 
      }}
    />
  );
};
