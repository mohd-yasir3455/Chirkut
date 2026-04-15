// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

/*
 * ACCESS CONTROL:
 * Only users with emails listed in VITE_ALLOWED_EMAILS environment variable can login.
 * To add more users, update the VITE_ALLOWED_EMAILS variable in .env.local:
 * VITE_ALLOWED_EMAILS=user1@example.com,user2@example.com,user3@example.com
 * 
 * Users must also have Firebase Auth accounts created in the Firebase Console.
 */

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      
      // Check if email is in allowed list
      const allowedEmailsStr = import.meta.env.VITE_ALLOWED_EMAILS;
      if (!allowedEmailsStr) {
        throw new Error('Access configuration error. Please contact administrator.');
      }
      
      const allowedEmails = allowedEmailsStr.split(',').map(email => email.trim());
      
      if (!allowedEmails.includes(email)) {
        throw new Error('Access denied. You are not authorized to use this application.');
      }
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isAdmin = () => {
    return user?.email === import.meta.env.VITE_ADMIN_EMAIL;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
