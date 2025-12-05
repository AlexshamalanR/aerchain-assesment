import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import RFPDetail from './pages/RFPDetail';
import Vendors from './pages/Vendors';
import CreateRFP from './pages/CreateRFP';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [currentPage, setCurrentPage] = React.useState<string>('dashboard');
  const [selectedRFPId, setSelectedRFPId] = React.useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onSelectRFP={(id) => {
              setSelectedRFPId(id);
              setCurrentPage('rfp-detail');
            }}
            onCreateRFP={() => setCurrentPage('create-rfp')}
            onManageVendors={() => setCurrentPage('vendors')}
          />
        );
      case 'create-rfp':
        return (
          <CreateRFP
            onBack={() => setCurrentPage('dashboard')}
            onSuccess={() => setCurrentPage('dashboard')}
          />
        );
      case 'vendors':
        return <Vendors onBack={() => setCurrentPage('dashboard')} />;
      case 'rfp-detail':
        return (
          <RFPDetail
            rfpId={selectedRFPId!}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      default:
        return <Dashboard onSelectRFP={() => {}} onCreateRFP={() => {}} onManageVendors={() => {}} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📋 RFP Management System</h1>
        <nav className="nav-buttons">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('vendors')}
            className={currentPage === 'vendors' ? 'active' : ''}
          >
            Vendors
          </button>
        </nav>
      </header>
      <main className="app-main">{renderPage()}</main>
    </div>
  );
};

export default App;
