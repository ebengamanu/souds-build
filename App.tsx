import React, { useState, useEffect } from 'react';
import { Landing } from './views/Landing';
import { Auth } from './views/Auth';
import { ArtistDashboard } from './views/ArtistDashboard';
import { BuyerMarketplace } from './views/BuyerMarketplace';
import { BuyerProDashboard } from './views/BuyerProDashboard';
import { InstallPrompt } from './components/InstallPrompt';
import { User, UserRole } from './types';
import { getCurrentUser, setCurrentUserSession } from './services/store';

const App: React.FC = () => {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      // Auto-route based on role if logged in
      if (storedUser.role === UserRole.ARTIST) {
          setView('artist-dashboard');
      } else if (storedUser.role === UserRole.BUYER_PRO) {
          setView('buyer-dashboard');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === UserRole.ARTIST) {
        setView('artist-dashboard');
    } else if (loggedInUser.role === UserRole.BUYER_PRO) {
        setView('buyer-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUserSession(null);
    setView('landing');
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Landing onNavigate={setView} />;
      case 'login':
        return <Auth view="login" onNavigate={setView} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <Auth view="register" onNavigate={setView} onLoginSuccess={handleLoginSuccess} />;
      case 'register-buyer':
        return <Auth view="register-buyer" onNavigate={setView} onLoginSuccess={handleLoginSuccess} />;
      case 'artist-dashboard':
        return user ? <ArtistDashboard user={user} onLogout={handleLogout} onNavigate={setView} /> : <Auth view="login" onNavigate={setView} onLoginSuccess={handleLoginSuccess} />;
      case 'buyer-dashboard':
        return user ? <BuyerProDashboard user={user} onLogout={handleLogout} onNavigate={setView} /> : <Auth view="login" onNavigate={setView} onLoginSuccess={handleLoginSuccess} />;
      case 'marketplace':
        return <BuyerMarketplace onNavigate={setView} />;
      default:
        return <Landing onNavigate={setView} />;
    }
  };

  return (
    <div className="font-sans">
      <InstallPrompt />
      {renderView()}
    </div>
  );
};

export default App;