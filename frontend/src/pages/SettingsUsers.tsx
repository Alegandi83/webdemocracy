import React, { useState, useEffect } from 'react';
import { Users, Shield, Info, Search } from 'lucide-react';
import { User } from '../types';

const SettingsUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Errore nel caricamento utenti');
      }
    } catch (error) {
      console.error('Errore nel caricamento utenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Cambiare il ruolo di "${user.name}" da "${getRoleLabel(user.user_role)}" a "${getRoleLabel(newRole)}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setSuccessMessage(`✅ Ruolo aggiornato con successo per ${updatedUser.name}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Errore nell\'aggiornamento del ruolo');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornare il ruolo:', error);
      alert('Errore nell\'aggiornamento');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'pollster': return '#8b5cf6';
      case 'editor': return '#f59e0b';
      case 'user': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'pollster': return 'Pollster';
      case 'editor': return 'Editor';
      case 'user': return 'User';
      default: return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Accesso completo a tutte le funzionalità';
      case 'pollster': return 'Può creare e gestire sondaggi';
      case 'editor': return 'Può accedere a Notizie e Mappa';
      case 'user': return 'Può solo votare nei sondaggi';
      default: return '';
    }
  };

  // Filtra utenti in base alla ricerca
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento utenti...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Users size={32} />
        Gestione Utenti
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Gestisci i ruoli degli utenti registrati nel sistema
      </p>

      {successMessage && (
        <div className="success" style={{ marginBottom: '1.5rem' }}>
          {successMessage}
        </div>
      )}

      {/* Info Box sui Ruoli */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Info size={20} style={{ color: '#3b82f6' }} />
          <strong style={{ color: '#1e40af', fontSize: '1rem' }}>Informazioni sui Ruoli</strong>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: '#ef4444' }} /> Admin:
            </strong> Accesso completo (impostazioni + creazione sondaggi)
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: '#8b5cf6' }} /> Pollster:
            </strong> Può creare e gestire sondaggi
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: '#f59e0b' }} /> Editor:
            </strong> Può accedere a Notizie e Mappa
          </div>
          <div>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: '#10b981' }} /> User:
            </strong> Può solo partecipare ai sondaggi
          </div>
        </div>
      </div>

      {/* Barra di ricerca */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#94a3b8',
            pointerEvents: 'none'
          }} 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          placeholder="Cerca utenti per nome o email..."
          style={{ 
            paddingLeft: '2.75rem',
            width: '100%',
            fontSize: '0.9375rem'
          }}
        />
      </div>

      {/* Lista Utenti */}
      {filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            {searchTerm ? 'Nessun utente trovato per questa ricerca' : 'Nessun utente registrato'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="card"
              style={{
                padding: '0.875rem 1rem',
                transition: 'var(--transition)',
                cursor: 'default'
              }}
            >
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {/* User Info */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {user.name}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: getRoleBadgeColor(user.user_role) + '15',
                      color: getRoleBadgeColor(user.user_role),
                      fontWeight: '600',
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {getRoleLabel(user.user_role)}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <span>📧 {user.email}</span>
                    {user.last_login_date && (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                        • Ultimo accesso: {new Date(user.last_login_date).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Selector */}
                <div style={{ minWidth: '180px' }}>
                  <select
                    value={user.user_role}
                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.875rem',
                      margin: 0,
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="user">👤 User</option>
                    <option value="editor">✏️ Editor</option>
                    <option value="pollster">📊 Pollster</option>
                    <option value="admin">⚡ Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {users.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Totale Utenti
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
              {users.filter(u => u.user_role === 'admin').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Admin
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
              {users.filter(u => u.user_role === 'pollster').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Pollster
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {users.filter(u => u.user_role === 'editor').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Editor
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {users.filter(u => u.user_role === 'user').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              User
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsUsers;

