import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Lock, Shield, Link as LinkIcon, Database, Users, Tag } from 'lucide-react';
import SettingsUrl from './SettingsUrl';
import SettingsData from './SettingsData';
import SettingsUsers from './SettingsUsers';
import SettingsTags from './SettingsTags';
import SidebarLayout from '../components/SidebarLayout';

const Settings: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/user/is-admin');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Errore nel controllo admin:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <Lock size={64} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Accesso Negato
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
            Solo gli amministratori possono accedere a questa sezione.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      path: '/settings/url',
      label: 'Gestione URL',
      icon: LinkIcon,
      description: 'Configura URL per QR Code'
    },
    {
      path: '/settings/data',
      label: 'Gestione Dati',
      icon: Database,
      description: 'Crea o elimina dati'
    },
    {
      path: '/settings/users',
      label: 'Gestione Utenti',
      icon: Users,
      description: 'Amministra ruoli utenti'
    },
    {
      path: '/settings/tags',
      label: 'Gestione Tags',
      icon: Tag,
      description: 'Crea e gestisci tag'
    }
  ];

  const sidebar = (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)'
      }}>
        <Shield size={28} style={{ color: 'var(--primary)' }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            Impostazioni
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Pannello Admin
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/settings/url' && location.pathname === '/settings');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                fontWeight: isActive ? '600' : '500',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9375rem' }}>{item.label}</div>
                <div style={{ 
                  fontSize: '0.8125rem', 
                  color: 'var(--text-tertiary)',
                  fontWeight: '400'
                }}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #fde68a'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⚠️ Attenzione</strong>
          Sei nell'area amministratore. Le modifiche effettuate qui influenzano l'intero sistema.
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout sidebar={sidebar} sidebarPosition="left">
      <Routes>
        <Route path="/" element={<SettingsUrl />} />
        <Route path="/url" element={<SettingsUrl />} />
        <Route path="/data" element={<SettingsData />} />
        <Route path="/users" element={<SettingsUsers />} />
        <Route path="/tags" element={<SettingsTags />} />
      </Routes>
    </SidebarLayout>
  );
};

export default Settings;
