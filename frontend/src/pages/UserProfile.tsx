import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Calendar, MapPin, Globe, Shield, Clock, Wifi, Users, X, Check, Edit } from 'lucide-react';
import { User, Group } from '../types';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
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
        // Carica anche i gruppi dell'utente
        await loadUserGroups(data.id);
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

  const loadUserGroups = async (userId: number) => {
    try {
      setLoadingGroups(true);
      const response = await fetch(`/api/users/${userId}/groups`);
      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
      } else {
        console.error('Errore nel caricamento gruppi utente');
      }
    } catch (error) {
      console.error('Errore nel caricamento gruppi utente:', error);
    } finally {
      setLoadingGroups(false);
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
    <div>
      {/* Header */}
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

      {/* Layout con sidebar + pannello centrale */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem' }}>
        {/* Sidebar sinistra: Informazioni Account */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}>
            <Shield size={20} />
            Informazioni Account
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <Mail size={16} />
                Email
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                {user.email}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <Shield size={16} />
                Ruolo
              </div>
              <div style={{
                display: 'inline-block',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                background: getRoleBadgeColor(user.user_role) + '15',
                color: getRoleBadgeColor(user.user_role),
                fontWeight: '600',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {getRoleLabel(user.user_role)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <Calendar size={16} />
                Data Registrazione
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                {new Date(user.registration_date).toLocaleDateString('it-IT')}
              </div>
            </div>

            {user.last_login_date && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <Clock size={16} />
                  Ultimo Accesso
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  {new Date(user.last_login_date).toLocaleString('it-IT')}
                </div>
              </div>
            )}

            {user.last_ip_address && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <Wifi size={16} />
                  IP Address
                </div>
                <div style={{ 
                  fontSize: '0.9375rem', 
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace'
                }}>
                  {user.last_ip_address}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pannello centrale: Colonna con Gruppi + Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pannello Gruppi Utente (compatto) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                Gruppi Utente
              </h3>
              <div style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}>
                <strong>Nota:</strong> Gestiti dagli admin
              </div>
            </div>

            {loadingGroups ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                Caricamento gruppi...
              </div>
            ) : userGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <Users size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  Non appartieni ancora a nessun gruppo
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                  Contatta un amministratore per essere aggiunto a un gruppo
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {userGroups.map(group => (
                  <div
                    key={group.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      color: '#475569',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Users size={14} />
                    {group.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Informazioni Personali */}
          <div className="card">
            {editing ? (
              /* Modalità editing inline */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Data di Nascita</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="form-input"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Genere</label>
                  <select
                    name="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleziona...</option>
                    <option value="Maschio">Maschio</option>
                    <option value="Femmina">Femmina</option>
                    <option value="Altro">Altro</option>
                    <option value="Preferisco non specificare">Preferisco non specificare</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Regione di Residenza</label>
                  <input
                    type="text"
                    name="address_region"
                    className="form-input"
                    value={formData.address_region}
                    onChange={handleInputChange}
                    placeholder="Es. Lombardia, Italia"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Lingua Preferita</label>
                  <select
                    name="preferred_language"
                    className="form-input"
                    value={formData.preferred_language}
                    onChange={handleInputChange}
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Geolocalizzazione</label>
                  <input
                    type="text"
                    name="actual_geolocation"
                    className="form-input"
                    value={formData.actual_geolocation}
                    onChange={handleInputChange}
                    placeholder="Es. Milano, Italia"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      loadUserProfile();
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                  >
                    <X size={16} />
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                  >
                    <Check size={16} />
                    Salva
                  </button>
                </div>
              </form>
            ) : (
              /* Modalità visualizzazione normale */
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                    Informazioni Personali
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Nome
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: formData.name ? '#0f172a' : '#94a3b8' }}>
                        {formData.name || 'Non specificato'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Data di Nascita
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: formData.date_of_birth ? '#0f172a' : '#94a3b8' }}>
                        {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('it-IT') : 'Non specificata'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Genere
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: formData.gender ? '#0f172a' : '#94a3b8' }}>
                        {formData.gender || 'Non specificato'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Regione di Residenza
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: formData.address_region ? '#0f172a' : '#94a3b8' }}>
                        {formData.address_region || 'Non specificata'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Lingua Preferita
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                        {formData.preferred_language === 'it' ? 'Italiano' : 
                         formData.preferred_language === 'en' ? 'English' :
                         formData.preferred_language === 'fr' ? 'Français' :
                         formData.preferred_language === 'de' ? 'Deutsch' :
                         formData.preferred_language === 'es' ? 'Español' : 
                         'Italiano'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Geolocalizzazione
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: formData.actual_geolocation ? '#0f172a' : '#94a3b8' }}>
                        {formData.actual_geolocation || 'Non specificata'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                  >
                    <Edit size={16} />
                    Modifica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

