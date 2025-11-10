import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Calendar, MapPin, Globe, Shield, Clock, Wifi } from 'lucide-react';
import { User } from '../types';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    address_region: '',
    preferred_language: 'it',
    actual_geolocation: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          name: data.name || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          gender: data.gender || '',
          address_region: data.address_region || '',
          preferred_language: data.preferred_language || 'it',
          actual_geolocation: data.actual_geolocation || ''
        });
        setError(null);
      } else {
        setError('Errore nel caricamento del profilo');
      }
    } catch (err) {
      setError('Errore nel caricamento del profilo');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSuccess('Profilo aggiornato con successo!');
        setEditing(false);
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Errore nell\'aggiornamento del profilo');
      }
    } catch (err) {
      setError('Errore nell\'aggiornamento del profilo');
      console.error('Errore:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Amministratore';
      case 'pollster': return 'Creatore Sondaggi';
      case 'user': return 'Utente';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'pollster': return '#8b5cf6';
      case 'user': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Caricamento profilo...</div>;
  }

  if (!user) {
    return <div className="error">Profilo non trovato</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <UserIcon size={40} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>
            Profilo Utente
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Gestisci le tue informazioni personali
          </p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Informazioni Non Modificabili */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Shield size={24} />
          Informazioni Account
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Email
            </label>
            <div style={{ 
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '500'
            }}>
              {user.email}
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Ruolo
            </label>
            <div style={{ 
              padding: '0.75rem',
              background: getRoleBadgeColor(user.user_role) + '15',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              color: getRoleBadgeColor(user.user_role)
            }}>
              {getRoleLabel(user.user_role)}
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Data Registrazione
            </label>
            <div style={{ 
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)'
            }}>
              {new Date(user.registration_date).toLocaleDateString('it-IT')}
            </div>
          </div>

          {user.last_login_date && (
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem'
              }}>
                <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Ultimo Accesso
              </label>
              <div style={{ 
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)'
              }}>
                {new Date(user.last_login_date).toLocaleString('it-IT')}
              </div>
            </div>
          )}

          {user.last_ip_address && (
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem'
              }}>
                <Wifi size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                IP Address
              </label>
              <div style={{ 
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {user.last_ip_address}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modificabile */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem',
            margin: 0
          }}>
            Informazioni Personali
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              Modifica Profilo
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid',
            gap: '1rem'
          }}>
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={16} />
                Nome
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Data di Nascita
              </label>
              <input
                type="date"
                name="date_of_birth"
                className="form-input"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <UserIcon size={16} />
                Genere
              </label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!editing}
              >
                <option value="">Seleziona...</option>
                <option value="Maschio">Maschio</option>
                <option value="Femmina">Femmina</option>
                <option value="Altro">Altro</option>
                <option value="Preferisco non specificare">Preferisco non specificare</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Regione di Residenza
              </label>
              <input
                type="text"
                name="address_region"
                className="form-input"
                value={formData.address_region}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="Es. Lombardia, Italia"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Globe size={16} />
                Lingua Preferita
              </label>
              <select
                name="preferred_language"
                className="form-input"
                value={formData.preferred_language}
                onChange={handleInputChange}
                disabled={!editing}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Geolocalizzazione
              </label>
              <input
                type="text"
                name="actual_geolocation"
                className="form-input"
                value={formData.actual_geolocation}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="Es. Milano, Italia"
              />
            </div>
          </div>

          {editing && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  loadUserProfile(); // Reset form
                }}
                className="btn btn-secondary"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Salva Modifiche
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;

