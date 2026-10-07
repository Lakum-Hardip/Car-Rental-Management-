import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' | 'admin' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
          setUserType(res.user_type);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const loginCustomer = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.success) {
      setUser(res.customer);
      setUserType('customer');
      return { success: true };
    }
    return { success: false, error: res?.error || 'Invalid credentials' };
  };

  const loginAdmin = async (username, password) => {
    const res = await api.adminLogin(username, password);
    if (res && res.success) {
      setUser(res.admin);
      setUserType('admin');
      return { success: true };
    }
    return { success: false, error: res?.error || 'Invalid credentials' };
  };

  const registerCustomer = async (formData) => {
    const res = await api.register(formData);
    if (res && res.success) {
      setUser(res.customer);
      setUserType('customer');
      return { success: true };
    }
    return { success: false, error: res?.error || 'Registration failed' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        loginCustomer,
        loginAdmin,
        registerCustomer,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
