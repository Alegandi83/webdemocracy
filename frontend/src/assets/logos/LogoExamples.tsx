// 📁 Esempi di utilizzo dei loghi nell'applicazione Web Democracy
// Questo file mostra come importare e utilizzare i loghi nei componenti React

import React from 'react';

// Import dei percorsi loghi (ora serviti dalla cartella public)
const LogoPrimary = '/assets/logos/primary/logo.svg';
const LogoTransparent = '/assets/logos/primary/logo-transparent.svg';
const LogoSmall = '/assets/logos/variants/logo-small.svg';
const LogoIcon = '/assets/logos/variants/logo-icon.svg';

/**
 * Componente di esempio per mostrare tutti i loghi disponibili
 */
const LogoExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
      <h2>🎨 Loghi Disponibili - Web Democracy</h2>
      
      {/* Logo Principale */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Logo Principale</h3>
        <img src={LogoPrimary} alt="Web Democracy Logo" />
        <pre style={{ fontSize: '0.8rem', color: '#666' }}>
          {`import LogoPrimary from '../assets/logos/primary/logo.svg';
<img src={LogoPrimary} alt="Web Democracy Logo" />`}
        </pre>
      </div>

      {/* Logo Trasparente */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#2c3e50', borderRadius: '8px' }}>
        <h3 style={{ color: 'white' }}>Logo Trasparente (su sfondo colorato)</h3>
        <img src={LogoTransparent} alt="Web Democracy Logo Transparent" />
      </div>

      {/* Logo Small */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Logo Small (per navbar)</h3>
        <img src={LogoSmall} alt="Web Democracy Logo Small" />
      </div>

      {/* Logo Icon */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Logo Icon (favicon/icona)</h3>
        <img src={LogoIcon} alt="Web Democracy Icon" />
      </div>
    </div>
  );
};

/**
 * Componente Header di esempio con logo
 */
export const HeaderWithLogo: React.FC = () => {
  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      backgroundColor: '#2c3e50',
      color: 'white'
    }}>
      <img 
        src={LogoTransparent} 
        alt="Survey App" 
        style={{ height: '40px', marginRight: '1rem' }}
      />
      <nav>
        <a href="/" style={{ color: 'white', marginRight: '1rem' }}>Home</a>
        <a href="/surveys" style={{ color: 'white', marginRight: '1rem' }}>Sondaggi</a>
        <a href="/create" style={{ color: 'white' }}>Crea</a>
      </nav>
    </header>
  );
};

/**
 * Componente Card con logo icon
 */
export const CardWithIcon: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={LogoIcon} 
        alt="Survey Icon" 
        style={{ width: '24px', height: '24px', marginRight: '1rem' }}
      />
      <div>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Nuovo Sondaggio</h4>
        <p style={{ margin: 0, color: '#666' }}>Crea un sondaggio per raccogliere opinioni</p>
      </div>
    </div>
  );
};

export default LogoExamples;
