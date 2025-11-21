import { useState, useEffect } from 'react';
import { initializeDatabase } from './lib/db';
import { AuthService } from './lib/auth';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { VendorRisk } from './components/VendorRisk';
import { ComplianceManager } from './components/ComplianceManager';
import { VAPTReporting } from './components/VAPTReporting';
import { PrivacyManager } from './components/PrivacyManager';
import { Settings } from './components/Settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await initializeDatabase();
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsInitialized(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-gray-900 mb-2">Initializing GRC Suite</p>
          <p className="text-gray-600 text-sm">Setting up your offline workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'users' && <UserManagement />}
      {currentPage === 'vendors' && <VendorRisk />}
      {currentPage === 'compliance' && <ComplianceManager />}
      {currentPage === 'vapt' && <VAPTReporting />}
      {currentPage === 'privacy' && <PrivacyManager />}
      {currentPage === 'settings' && <Settings />}
    </Layout>
  );
}
