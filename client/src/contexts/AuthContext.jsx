import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('pv_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/user/profile');
      setUser(res.data);
    } catch {
      localStorage.removeItem('pv_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const login = (token, userData) => {
    localStorage.setItem('pv_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('pv_token');
    setUser(null);
  };

  const refreshUser = fetchProfile;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
