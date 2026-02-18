import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tourpro_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('tourpro_token');
    if (!savedToken) { setLoading(false); return; }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setToken(savedToken);
    } catch (err) {
      localStorage.removeItem('tourpro_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('tourpro_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);

    toast.success(res.data.message || 'Logged in successfully!');
    return userData;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('tourpro_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);

    toast.success('Account created successfully!');
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('tourpro_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
