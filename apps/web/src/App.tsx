import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, Spin } from 'antd';
import { useThemeStore } from './store/themeStore';
import { useEffect, useState, lazy, Suspense } from 'react';

// Lazy load components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewSalePage = lazy(() => import('./pages/NewSalePage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const EngineersPage = lazy(() => import('./pages/EngineersPage'));
const SalesPersonsPage = lazy(() => import('./pages/SalesPersonsPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const InstallPage = lazy(() => import('./pages/InstallPage'));
const PendingInstallsPage = lazy(() => import('./pages/PendingInstallsPage'));
const PreviousPendingPage = lazy(() => import('./pages/PreviousPendingPage'));
const CancelledInstallsPage = lazy(() => import('./pages/CancelledInstallsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Spin size="large" />
  </div>
);

function App() {
  const { theme } = useThemeStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    if (theme === 'dark') {
      setIsDarkMode(true);
    } else if (theme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(mediaQuery.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          fontFamily: "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeightStrong: 600,
        },
      }}
    >
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/entry" element={<NewSalePage />} />
                <Route path="/report" element={<SalesPage />} />
                <Route path="/pending" element={<PendingInstallsPage />} />
                <Route path="/previous-pending" element={<PreviousPendingPage />} />
                <Route path="/cancelled" element={<CancelledInstallsPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/engineers" element={<EngineersPage />} />
                <Route path="/staff" element={<SalesPersonsPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="/unauthorized" element={<div>Unauthorized</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
}

export default App;
