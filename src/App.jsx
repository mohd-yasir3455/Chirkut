// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { useAuth } from './hooks/useAuth';
import './styles/globals.css';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const PublicView = lazy(() => import('./components/Public/PublicView'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const PaidThankYous = lazy(() => import('./pages/PaidThankYous'));
const MyMoments = lazy(() => import('./pages/MyMoments'));
const MenstrualTracker = lazy(() => import('./pages/MenstrualTracker'));

// Loading Fallback
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div className="spinner" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ isAdmin, children }) => {
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Main App Component
function App() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  // If not logged in, show only login page
  if (!user) {
    return (
      <BrowserRouter>
        <Analytics />
        <SpeedInsights />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  // User is logged in, show full app
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Analytics />
         <SpeedInsights />
        <Routes>
          {/* Public Route - accessible to all logged in users */}
          <Route path="/" element={<PublicView />} />
          <Route path="/moments" element={<MyMoments />} />
          <Route path="/tracker" element={<MenstrualTracker />} />

          {/* Admin Routes - only for admin users */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAdmin={isAdmin()}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/paid"
            element={
              <ProtectedRoute isAdmin={isAdmin()}>
                <PaidThankYous isAdmin={true} />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;
