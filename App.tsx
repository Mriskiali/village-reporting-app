import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';

import { Role } from './types';
import { PetugasHome } from './pages/petugas/Home';
import { CreateReport } from './pages/petugas/CreateReport';
import { PetugasHistory } from './pages/petugas/History';
import { PetugasProfile } from './pages/petugas/Profile';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageReports } from './pages/admin/ManageReports';
import { ManageUsers } from './pages/admin/ManageUsers';

const AppContent: React.FC = () => {
  const { auth } = useApp();
  const [currentPage, setCurrentPage] = React.useState<string>('login');

  const handleLoginSuccess = (role: Role) => {
    if (role === Role.ADMIN) {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('petugas-home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onSuccess={handleLoginSuccess} />;
      
      case 'petugas-home':
        return <PetugasHome navigate={setCurrentPage} />;
      case 'petugas-create':
        return <CreateReport navigate={setCurrentPage} />;
      case 'petugas-history':
        return <PetugasHistory navigate={setCurrentPage} />;
      case 'petugas-profile':
        return <PetugasProfile />;
      
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-reports':
        return <ManageReports />;
      case 'admin-users':
        return <ManageUsers />;
      
      default:
        return <Login onSuccess={handleLoginSuccess} />;
    }
  };

  if (!auth.isAuthenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;