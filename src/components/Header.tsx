import React from 'react';
import { Heart, Menu, X } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen, currentPage, onNavigate }) => {
  const navItems = [
    { label: 'Home', href: 'home' },
    { label: 'Doctors', href: 'doctors' },
    { label: 'Appointment', href: 'appointment' },
    { label: 'Blog', href: '#' }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold text-gray-900">itabaza</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.href.startsWith('#') ? null : onNavigate(item.href)}
                className={`font-medium transition-colors duration-200 ${
                  currentPage === item.href 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (!item.href.startsWith('#')) {
                      onNavigate(item.href);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`text-left font-medium transition-colors duration-200 ${
                    currentPage === item.href 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button className="text-left text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;