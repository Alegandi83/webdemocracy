import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PlusCircle, List, Home as HomeIcon, Settings as SettingsIcon, Menu, X, Newspaper, MapIcon, BarChart3 } from 'lucide-react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Information from './pages/Information';
import SurveyList from './pages/SurveyList';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import SurveyResults from './pages/SurveyResults';
import SurveyStatsPage from './pages/SurveyStats';
import UserProfile from './pages/UserProfile';
import News from './pages/News';
import Map from './pages/Map';
import Analytics from './pages/Analytics';
import Sponsor from './pages/Sponsor';
import HeaderLogos from './components/HeaderLogos';
import UserInfo from './components/UserInfo';
import QuestionBlockIcon from './components/QuestionBlockIcon';
import ProtectedRoute from './components/ProtectedRoute';
import databricksLogo from './assets/logos/others/Databricks-Emblem.png';
import { surveyApi } from './services/api';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    is_admin: false,
    is_pollster: false,
    is_editor: false,
    loading: true
  });
  const [baseUrl, setBaseUrl] = useState<string>('https://example.com');
  const [databricksOneUrl, setDatabricksOneUrl] = useState<string | null>(null);
  
  // Verifica se siamo nella pagina sponsor
  const isSponsorPage = location.pathname === '/sponsor';

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
            is_editor: userData.is_editor || false,
            loading: false
          });
        } else {
          setUserPermissions({ is_admin: false, is_pollster: false, is_editor: false, loading: false });
        }
      } catch (error) {
        console.error('Error loading user permissions:', error);
        setUserPermissions({ is_admin: false, is_pollster: false, is_editor: false, loading: false });
      }
    };
    loadUserPermissions();
  }, []);

  // Carica l'URL base al mount
  React.useEffect(() => {
    const loadBaseUrl = async () => {
      try {
        const setting = await surveyApi.getSetting('qr_code_url');
        setBaseUrl(setting.value);
      } catch (error) {
        console.error('Error loading base URL:', error);
      }
    };
    loadBaseUrl();
  }, []);

  // Carica l'URL di Databricks One
  React.useEffect(() => {
    const loadDatabricksOneUrl = async () => {
      try {
        const response = await fetch('/api/config/urls');
        if (response.ok) {
          const config = await response.json();
          setDatabricksOneUrl(config.databricks_one_url);
        }
      } catch (error) {
        console.error('Error loading Databricks One URL:', error);
      }
    };
    loadDatabricksOneUrl();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
      <div className="App">
        {/* Header con loghi partner */}
        <HeaderLogos />
        
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-header">
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
              {/* Link esterno a Databricks One - PRIMO A SINISTRA */}
              {databricksOneUrl && (
                <a 
                  href={databricksOneUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <img 
                    src={databricksLogo} 
                    alt="Databricks" 
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                  />
                  One
                </a>
              )}
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                <HomeIcon size={20} />
                Home
              </Link>
              {/* Nascondi questi link nella pagina sponsor */}
              {!isSponsorPage && (
                <>
              {/* Mostra "Notizie" solo per admin e editor */}
              {!userPermissions.loading && userPermissions.is_editor && (
                <Link to="/news" className="nav-link" onClick={closeMobileMenu}>
                  <Newspaper size={20} />
                  Notizie
                </Link>
              )}
              {/* Mostra "Mappa" solo per admin e editor */}
              {!userPermissions.loading && userPermissions.is_editor && (
                <Link to="/map" className="nav-link" onClick={closeMobileMenu}>
                  <MapIcon size={20} />
                  Mappa
                </Link>
              )}
                  <Link to="/analytics" className="nav-link" onClick={closeMobileMenu}>
                    <BarChart3 size={20} />
                    Analytics
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
                </>
              )}
              <Link 
                to="/information" 
                className="nav-link" 
                onClick={closeMobileMenu}
                style={{ padding: '0.5rem', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                title="Informazioni"
              >
                <QuestionBlockIcon size={42} />
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surveys" element={<SurveyList />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route 
              path="/news" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <News />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <Map />
                </ProtectedRoute>
              } 
            />
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
            <Route path="/information" element={<Information />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/survey/:id" element={<SurveyDetail />} />
            <Route path="/survey/:id/results" element={<SurveyResults />} />
            <Route path="/survey/:id/stats" element={<SurveyStatsPage />} />
          </Routes>
        </main>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
