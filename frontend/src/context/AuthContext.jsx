import { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

// role: 'jamaah' | 'admin_biasa' | 'kepala_admin'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const loggedInUser = data.user ?? data;
    if (data.token) localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    return authService.register(payload);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const homePathFor = (role) => {
    if (role === 'kepala_admin') return '/kepala/dashboard';
    if (role === 'admin_biasa') return '/admin/dashboard';
    return '/jamaah/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, homePathFor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
