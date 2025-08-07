import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthComponents from './AuthComponents';
import PromptManager from './PromptManager';
import UserProfile from './UserProfile';
import './App.css';

// Main App Content (authenticated users only)
function AppContent() {
  const [currentView, setCurrentView] = useState('prompts');
  const { user, logout } = useAuth();

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-left">
          <button
            className={`nav-button ${currentView === 'prompts' ? 'active' : ''}`}
            onClick={() => setCurrentView('prompts')}
          >
            Prompt Manager
          </button>
          <button
            className={`nav-button ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            Profile
          </button>
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <span className="user-name">👋 {user?.name}</span>
            <span className="user-org">{user?.organization?.name}</span>
          </div>
          <button
            className="nav-button logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="app-content">
        {currentView === 'prompts' ? <PromptManager /> : <UserProfile />}
      </div>
    </div>
  );
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading your workspace...</p>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

// Router Component
function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AppContent /> : <AuthComponents />;
}

export default App;
