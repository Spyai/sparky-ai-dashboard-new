import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { getUserFarms } from './lib/supabase';
import LoginForm from './components/Auth/LoginForm';
import FarmSetup from './components/Farm/FarmSetup';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Scheduler from './pages/Scheduler';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [hasFarms, setHasFarms] = useState<boolean | null>(null);
  const [checkingFarms, setCheckingFarms] = useState(true);

  useEffect(() => {
    const checkUserFarms = async () => {
      if (!user?.phone) {
        setCheckingFarms(false);
        return;
      }

      try {
        const { data, error } = await getUserFarms(user.phone);
        if (error) throw error;
        
        setHasFarms(data && data.length > 0);
      } catch (error) {
        console.error('Error checking farms:', error);
        setHasFarms(false);
      } finally {
        setCheckingFarms(false);
      }
    };

    checkUserFarms();
  }, [user]);

  if (loading || checkingFarms) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (hasFarms === false) {
    return <FarmSetup onComplete={() => setHasFarms(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/farms" element={<Dashboard />} />
        <Route path="/alerts" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/chat" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;