import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import '../App.css';

interface UserData {
  id: number;
  name: string;
  email: string;
  user_role: string;
  profile_photo?: string;
  is_local: boolean;
}

const UserInfo: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log('UserInfo: Fetching user data from /api/user');
        const response = await fetch('/api/user');
        console.log('UserInfo: Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('UserInfo: User data received:', data);
          setUser(data);
        } else {
          console.error('UserInfo: Failed to fetch user data, status:', response.status);
        }
      } catch (error) {
        console.error('Errore nel caricamento informazioni utente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Debug: mostra sempre lo stato
  console.log('UserInfo render - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="nav-link" style={{ opacity: 0.5 }}>
        <User size={20} />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Link 
      to="/profile"
      className="nav-link user-info" 
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        textDecoration: 'none'
      }}
      title={user.email}
    >
      <User size={20} />
      <span>{user.name}</span>
    </Link>
  );
};

export default UserInfo;

