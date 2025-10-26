import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, PlusCircle, List, Home as HomeIcon, Settings as SettingsIcon } from 'lucide-react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import SurveyList from './pages/SurveyList';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import SurveyResults from './pages/SurveyResults';
import SurveyStatsPage from './pages/SurveyStats';
import HeaderLogos from './components/HeaderLogos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header con loghi partner */}
        <HeaderLogos />
        
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              <BarChart3 size={32} strokeWidth={2.5} />
              Web Democracy
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                <HomeIcon size={20} />
                Home
              </Link>
              <Link to="/surveys" className="nav-link">
                <List size={20} />
                Sondaggi
              </Link>
              <Link to="/create" className="nav-link">
                <PlusCircle size={20} />
                Crea Sondaggio
              </Link>
              <Link to="/settings" className="nav-link">
                <SettingsIcon size={20} />
                Impostazioni
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surveys" element={<SurveyList />} />
            <Route path="/create" element={<CreateSurvey />} />
            <Route path="/settings" element={<Settings />} />
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
