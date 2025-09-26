import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CoinsProvider } from './contexts/CoinsContext';
import { BattlesProvider } from './contexts/BattlesContext';
import { RafflesProvider } from './contexts/RafflesContext';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <LoadingSpinner size="lg" text="Cargando aplicación..." />
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthContainer />;
};

function App() {
  return (
    <AuthProvider>
      <CoinsProvider>
        <BattlesProvider>
          <RafflesProvider>
            <AppContent />
          </RafflesProvider>
        </BattlesProvider>
      </CoinsProvider>
    </AuthProvider>
  );
}

export default App;
