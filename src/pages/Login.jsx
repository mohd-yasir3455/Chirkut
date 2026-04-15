// src/pages/Login.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await login(email, password);
      // Login successful - routing handled by App.jsx
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="login-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="login-icon">✨</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your thank you moments</p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading || !email || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              '✨ Sign In'
            )}
          </motion.button>
        </form>

        {/* Help Text */}
        <motion.p
          className="login-help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          💡 Only authorized users can access this application
        </motion.p>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="decoration decoration-1"
        animate={{ rotate: 360, y: [0, 20, 0] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, y: { duration: 4, repeat: Infinity } }}
      >
        ✨
      </motion.div>

      <motion.div
        className="decoration decoration-2"
        animate={{ rotate: -360, x: [0, 20, 0] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, x: { duration: 5, repeat: Infinity } }}
      >
        💝
      </motion.div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #FFF8F0 0%, #F5E6FF 100%);
          position: relative;
          overflow: hidden;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 181, 216, 0.3);
          padding: 48px;
          box-shadow: 0 20px 60px rgba(255, 181, 216, 0.2);
          position: relative;
          z-index: 10;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon {
          font-size: 56px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .login-header h1 {
          font-size: 28px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .login-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert-error {
          background: rgba(255, 107, 107, 0.1);
          color: #FF6B6B;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-group input {
          padding: 12px 16px;
          border: 1.5px solid rgba(255, 181, 216, 0.3);
          border-radius: 12px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.8);
          color: var(--text-primary);
          transition: all var(--transition-fast);
          margin: 0;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-blush);
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 181, 216, 0.1);
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper input {
          width: 100%;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          opacity: 0.6;
          transition: opacity var(--transition-fast);
          padding: 4px;
        }

        .toggle-password:hover {
          opacity: 1;
        }

        .toggle-password:disabled {
          cursor: not-allowed;
        }

        .btn {
          margin: 0;
        }

        .login-help {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          margin-top: 8px;
        }

        .decoration {
          position: absolute;
          font-size: 80px;
          opacity: 0.08;
          z-index: 1;
        }

        .decoration-1 {
          top: -20px;
          right: -20px;
        }

        .decoration-2 {
          bottom: -20px;
          left: -20px;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 32px 24px;
          }

          .login-header h1 {
            font-size: 24px;
          }

          .login-icon {
            font-size: 48px;
          }

          .decoration {
            font-size: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
