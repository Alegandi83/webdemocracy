import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  user_count: number;
  created_at: string;
}

const SettingsGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Stati per creazione/modifica
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // Stati per associazione utenti (inline)
  const [managingUsersGroupId, setManagingUsersGroupId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    loadGroups();
    loadAllUsers();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadGroupUsers = async (groupId: number) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/users`);
      if (response.ok) {
        const data = await response.json();
        setGroupUsers(data);
        setSelectedUserIds(data.map((u: User) => u.id));
      }
    } catch (err) {
      console.error('Error loading group users:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!formName.trim()) {
      setError('Il nome del gruppo è obbligatorio');
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null
        })
      });

      if (response.ok) {
        setSuccess('Gruppo creato con successo');
        cancelCreate();
        loadGroups();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Errore nella creazione del gruppo');
      }
    } catch (err) {
      setError('Errore nella creazione del gruppo');
    }
  };

  const handleUpdateGroup = async (groupId: number) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null
        })
      });

      if (response.ok) {
        setSuccess('Gruppo aggiornato con successo');
        setEditingGroupId(null);
        setEditName('');
        setEditDescription('');
        loadGroups();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Errore nell\'aggiornamento del gruppo');
      }
    } catch (err) {
      setError('Errore nell\'aggiornamento del gruppo');
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il gruppo "${groupName}"?\n\nQuesta azione eliminerà tutte le associazioni con gli utenti.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Gruppo eliminato con successo');
        loadGroups();
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Errore nell\'eliminazione del gruppo');
      }
    } catch (err) {
      setError('Errore nell\'eliminazione del gruppo');
    }
  };

  const handleSaveUserAssociations = async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: selectedUserIds
        })
      });

      if (response.ok) {
        setSuccess('Utenti associati con successo');
        setManagingUsersGroupId(null);
        setSelectedUserIds([]);
        setSearchTerm('');
        loadGroups();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Errore nell\'associazione degli utenti');
      }
    } catch (err) {
      setError('Errore nell\'associazione degli utenti');
    }
  };

  const startEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setEditName(group.name);
    setEditDescription(group.description || '');
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditName('');
    setEditDescription('');
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setFormName('');
    setFormDescription('');
  };

  const startAssociateUsers = async (group: Group) => {
    setSelectedGroup(group);
    await loadGroupUsers(group.id);
    setManagingUsersGroupId(group.id);
    setSearchTerm('');
  };

  const cancelManageUsers = () => {
    setManagingUsersGroupId(null);
    setSelectedUserIds([]);
    setSearchTerm('');
    setSelectedGroup(null);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          color: '#0f172a',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Users size={32} />
          Gestione Gruppi
        </h1>

        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Nuovo Gruppo
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Lista Gruppi */}
      {loading ? (
        <div className="loading">Caricamento gruppi...</div>
      ) : groups.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <Users size={48} style={{
            margin: '0 auto 1.5rem',
            color: '#94a3b8',
            opacity: 0.6
          }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '600' }}>
            Nessun gruppo creato
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Inizia creando il tuo primo gruppo per organizzare gli utenti.
          </p>
          <button onClick={() => setIsCreating(true)} className="btn btn-primary">
            <Plus size={20} />
            Crea Primo Gruppo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Card creazione nuovo gruppo inline */}
          {isCreating && (
            <div className="card" style={{ border: '2px solid #3b82f6' }}>
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nome Gruppo *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                    placeholder="Es: Team Marketing"
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Descrizione</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-input"
                    rows={2}
                    placeholder="Descrizione opzionale del gruppo"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={cancelCreate}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                  >
                    <X size={16} />
                    Annulla
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                  >
                    <Check size={16} />
                    Crea Gruppo
                  </button>
                </div>
              </div>
            </div>
          )}

          {groups.map(group => (
            <div key={group.id} className="card">
              {managingUsersGroupId === group.id ? (
                /* Modalità gestione utenti inline */
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                    Gestisci Utenti - {group.name}
                  </h3>

                  {/* Barra ricerca */}
                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input"
                      placeholder="Cerca utenti per nome o email..."
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>

                  {/* Lista utenti */}
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {filteredUsers.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Nessun utente trovato
                      </div>
                    ) : (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          onClick={() => toggleUserSelection(user.id)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: selectedUserIds.includes(user.id) ? '#f0f9ff' : 'white',
                            transition: 'background 0.2s'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => {}}
                            style={{ cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.9375rem' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user.email}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {selectedUserIds.length} {selectedUserIds.length === 1 ? 'utente selezionato' : 'utenti selezionati'}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={cancelManageUsers}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <X size={16} />
                      Annulla
                    </button>
                    <button
                      onClick={handleSaveUserAssociations}
                      className="btn btn-primary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <Check size={16} />
                      Salva
                    </button>
                  </div>
                </div>
              ) : editingGroupId === group.id ? (
                /* Modalità editing inline */
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Nome Gruppo *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Descrizione</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="form-input"
                      rows={2}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <Users size={16} />
                    <span>{group.user_count} {group.user_count === 1 ? 'utente' : 'utenti'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <X size={16} />
                      Annulla
                    </button>
                    <button
                      onClick={() => handleUpdateGroup(group.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <Check size={16} />
                      Salva
                    </button>
                  </div>
                </div>
              ) : (
                /* Modalità visualizzazione normale */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                      {group.name}
                    </h3>
                    {group.description && (
                      <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                        {group.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                      <Users size={16} />
                      <span>{group.user_count} {group.user_count === 1 ? 'utente' : 'utenti'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => startAssociateUsers(group)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <Users size={16} />
                      Gestisci Utenti
                    </button>
                    <button
                      onClick={() => startEdit(group)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <Edit2 size={16} />
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    >
                      <Trash2 size={16} />
                      Elimina
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsGroups;

