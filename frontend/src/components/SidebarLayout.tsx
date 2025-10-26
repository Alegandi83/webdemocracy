import React, { ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarPosition?: 'left' | 'right';
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  sidebar, 
  children, 
  sidebarPosition = 'right' 
}) => {
  return (
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
      <div style={{ 
        width: '320px',
        flexShrink: 0,
        position: 'sticky',
        top: '1rem'
      }}>
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
  );
};

export default SidebarLayout;

