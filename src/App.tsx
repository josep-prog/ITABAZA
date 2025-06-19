import React, { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import DoctorsPage from './components/DoctorsPage';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'doctors':
        return <DoctorsPage />;
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
      />
      {renderCurrentPage()}
    </div>
  );
}

export default App;