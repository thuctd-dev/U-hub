import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>U</div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Đang tải...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
  </Routes>
);

import { Toaster } from 'sonner';

const App = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#7c3aed',
        colorBgContainer: '#1a1a2e',
        colorBgElevated: '#16213e',
        colorBorder: '#2a2a4a',
        colorText: '#e2e8f0',
        colorTextSecondary: '#94a3b8',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      components: {
        Modal: { contentBg: '#16213e', headerBg: '#16213e', titleColor: '#e2e8f0' },
        Input: { colorBgContainer: '#0f0f1a', colorBorder: '#2a2a4a' },
        Select: { colorBgContainer: '#0f0f1a', colorBgElevated: '#16213e', colorBorder: '#2a2a4a' },
      },
    }}
  >
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster theme="dark" position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
