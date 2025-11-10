import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, PlusCircle, List, Home as HomeIcon, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import SurveyList from './pages/SurveyList';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import SurveyResults from './pages/SurveyResults';
import SurveyStatsPage from './pages/SurveyStats';
import UserProfile from './pages/UserProfile';
import HeaderLogos from './components/HeaderLogos';
import UserInfo from './components/UserInfo';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    is_admin: false,
    is_pollster: false,
    loading: true
  });

  // Carica i permessi utente al mount
  React.useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUserPermissions({
            is_admin: userData.is_admin || false,
            is_pollster: userData.is_pollster || false,
            loading: false
          });
        } else {
          setUserPermissions({ is_admin: false, is_pollster: false, loading: false });
        }
      } catch (error) {
        console.error('Error loading user permissions:', error);
        setUserPermissions({ is_admin: false, is_pollster: false, loading: false });
      }
    };
    loadUserPermissions();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Header con loghi partner */}
        <HeaderLogos />
        
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-header">
              <Link to="/" className="nav-brand">
                <BarChart3 size={32} strokeWidth={2.5} />
                Web Democracy
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                <HomeIcon size={20} />
                Home
              </Link>
              <Link to="/surveys" className="nav-link" onClick={closeMobileMenu}>
                <List size={20} />
                Sondaggi
              </Link>
              {/* Mostra "Crea Sondaggio" solo per pollster e admin */}
              {!userPermissions.loading && userPermissions.is_pollster && (
                <Link to="/create" className="nav-link" onClick={closeMobileMenu}>
                  <PlusCircle size={20} />
                  Crea Sondaggio
                </Link>
              )}
              {/* Mostra "Impostazioni" solo per admin */}
              {!userPermissions.loading && userPermissions.is_admin && (
                <Link to="/settings" className="nav-link" onClick={closeMobileMenu}>
                  <SettingsIcon size={20} />
                  Impostazioni
                </Link>
              )}
              <UserInfo />
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surveys" element={<SurveyList />} />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute requirePollster={true}>
                  <CreateSurvey />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/*" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/survey/:id" element={<SurveyDetail />} />
            <Route path="/survey/:id/results" element={<SurveyResults />} />
            <Route path="/survey/:id/stats" element={<SurveyStatsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
