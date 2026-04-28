import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import { useApp, AppProvider } from './context/AppContext';
import { useReports } from './hooks/useReports';
import { useToast } from './hooks/useToast';
import { getOrCreateDeviceToken } from './utils';

import SplashScreen from './components/SplashScreen';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import ToastContainer from './components/ToastContainer';
import ReportScreen from './components/screens/ReportScreen';
import FeedScreen from './components/screens/FeedScreen';
import MapScreen from './components/screens/MapScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import DemoScreen from './components/screens/DemoScreen';

const AppContent: React.FC = () => {
  const { activeScreen, setActiveScreen, anonMode, toggleAnonMode } = useApp();
  const {
    reports,
    myTokens,
    upvoted,
    loadReports,
    addReport,
    toggleUpvote,
    addComment,
  } = useReports();
  const { toasts, showToast, removeToast } = useToast();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    getOrCreateDeviceToken();
    loadReports();
  }, [loadReports]);

  const handleLaunch = () => {
    setShowSplash(false);
    loadReports();
  };

  const handleNotification = () => {
    showToast('No new notifications', 'amber');
  };

  return (
    <>
      {showSplash && <SplashScreen onLaunch={handleLaunch} />}

      <div id="app-shell" className={!showSplash ? 'active' : ''}>
        <TopBar onNotification={handleNotification} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {activeScreen === 'report' && (
          <ReportScreen
            onSubmit={(report) => {
              addReport(report);
              setActiveScreen('dashboard');
            }}
            showToast={showToast}
            anonMode={anonMode}
            onToggleAnon={toggleAnonMode}
          />
        )}

        {activeScreen === 'feed' && (
          <FeedScreen
            reports={reports}
            upvoted={upvoted}
            onUpvote={(id) => toggleUpvote(id, getOrCreateDeviceToken())}
            onComment={(id, text) =>
              addComment(id, text)
            }
            showToast={showToast}
          />
        )}

        <MapScreen
          reports={reports}
          isActive={activeScreen === 'map'}
          showToast={showToast}
        />

        {activeScreen === 'dashboard' && (
          <DashboardScreen reports={reports} myTokens={myTokens} />
        )}

        {activeScreen === 'demo' && (
          <DemoScreen onGoToReport={() => setActiveScreen('report')} />
        )}

        <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
      </div>
    </>
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
