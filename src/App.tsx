import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import DoctorsPage from './components/DoctorsPage';
import AppointmentPage from './components/AppointmentPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AppointmentRecord from './components/dashboard/AppointmentRecord';
import Documents from './components/dashboard/Documents';
import Messages from './components/dashboard/Messages';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection />
                <StatsSection />
              </>
            } />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard/appointments" replace />} />
                    <Route path="appointments" element={<AppointmentRecord />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="messages" element={<Messages />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;