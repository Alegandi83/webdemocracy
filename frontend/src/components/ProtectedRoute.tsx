import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePollster?: boolean;
  requireEditor?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requirePollster = false,
  requireEditor = false
}) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          
          if (requireAdmin && !userData.is_admin) {
            setHasAccess(false);
          } else if (requirePollster && !userData.is_pollster) {
            setHasAccess(false);
          } else if (requireEditor && !userData.is_editor) {
            setHasAccess(false);
          } else {
            setHasAccess(true);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [requireAdmin, requirePollster, requireEditor]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <Lock size={64} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Accesso Negato
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {requireAdmin && 'Solo gli amministratori possono accedere a questa sezione.'}
            {requirePollster && !requireAdmin && 'Solo i pollster e gli amministratori possono creare sondaggi.'}
            {requireEditor && !requireAdmin && !requirePollster && 'Solo gli editor e gli amministratori possono accedere a questa sezione.'}
          </p>
          <a href="/" className="btn btn-primary">
            Torna alla Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

