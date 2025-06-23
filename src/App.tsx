import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import DoctorsPage from './components/DoctorsPage';
import AppointmentPage from './components/AppointmentPage';
import AuthPage from './components/AuthPage';

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const { user, logout } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'doctors':
        return <DoctorsPage />;
      case 'appointment':
        return <AppointmentPage />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <StatsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      {renderCurrentPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;