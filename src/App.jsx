// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import './styles/globals.css';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const PublicView = lazy(() => import('./components/Public/PublicView'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const PaidThankYous = lazy(() => import('./pages/PaidThankYous'));

// Loading Fallback
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div className="spinner" />
  </div>
);

// Navigation Component
const Navigation = ({ isAdmin, user, onLogout }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">✨</span>
          Thank You Tracker
        </Link>

        {user ? (
          <div className="nav-menu">
            <button
              className="menu-toggle"
              onClick={() => setShowMenu(!showMenu)}
            >
              ☰
            </button>

            <div className={`nav-links ${showMenu ? 'active' : ''}`}>
              <Link
                to="/"
                className="nav-link"
                onClick={() => setShowMenu(false)}
              >
                🏠 Home
              </Link>
              
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="nav-link"
                    onClick={() => setShowMenu(false)}
                  >
                    👑 Admin
                  </Link>
                  <Link
                    to="/paid"
                    className="nav-link"
                    onClick={() => setShowMenu(false)}
                  >
                    💝 Paid
                  </Link>
                </>
              )}

              <motion.button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
                whileHover={{ scale: 1.05 }}
              >
                👋 Logout
              </motion.button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            🔐 Login
          </Link>
        )}
      </div>

      <style>{`
        .navbar {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 181, 216, 0.2);
          padding: 16px 20px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .nav-logo:hover {
          color: var(--primary-blush);
        }

        .logo-icon {
          font-size: 24px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--primary-blush);
          background: rgba(255, 181, 216, 0.1);
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 181, 216, 0.2);
            padding: 12px 0;
            gap: 0;
          }

          .nav-links.active {
            display: flex;
          }

          .nav-link {
            width: 100%;
            padding: 12px 20px;
            border-radius: 0;
          }

          .nav-link:hover {
            background: rgba(255, 181, 216, 0.15);
          }

          .nav-links .btn {
            width: calc(100% - 40px);
            margin: 12px 20px 0;
          }
        }
      `}</style>
    </motion.nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ isAdmin, children }) => {
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Main App Component
function App() {
  const { user, loading, isAdmin, logout } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  // If not logged in, show only login page
  if (!user) {
    return (
      <BrowserRouter>
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
      <Navigation isAdmin={isAdmin()} user={user} onLogout={logout} />

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Route - accessible to all logged in users */}
          <Route path="/" element={<PublicView />} />

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
