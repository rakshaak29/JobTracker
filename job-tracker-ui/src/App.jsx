import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Applications from './components/Applications';
import ApplicationDetail from './components/ApplicationDetail';
import FollowUps from './components/FollowUps';
import { getApplications, getStats, getDueThisWeek, getOverdue } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [dueThisWeek, setDueThisWeek] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [apps, statsData, due, over] = await Promise.all([
        getApplications(),
        getStats(),
        getDueThisWeek(),
        getOverdue(),
      ]);
      setApplications(apps);
      setStats(statsData);
      setDueThisWeek(due);
      setOverdue(over);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedApp(null);
  };

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setActiveTab('detail');
  };

  const handleBackFromDetail = () => {
    setSelectedApp(null);
    setActiveTab('applications');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            applications={applications}
            dueThisWeek={dueThisWeek}
            onSelectApp={handleSelectApp}
            onNavigate={setActiveTab}
          />
        );
      case 'applications':
        return (
          <Applications
            applications={applications}
            onRefresh={loadData}
            onSelectApp={handleSelectApp}
          />
        );
      case 'detail':
        return selectedApp ? (
          <ApplicationDetail
            application={selectedApp}
            onBack={handleBackFromDetail}
            onRefresh={loadData}
          />
        ) : (
          <Applications
            applications={applications}
            onRefresh={loadData}
            onSelectApp={handleSelectApp}
          />
        );
      case 'followups':
        return (
          <FollowUps
            applications={applications}
            dueThisWeek={dueThisWeek}
            overdue={overdue}
            onRefresh={loadData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="main-content fade-in">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
