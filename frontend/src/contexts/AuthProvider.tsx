// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import axios from '@/services/axios';
import { User } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

export interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios.get('/auth/me')
    .then(res => {
      console.log('✅ User:', res.data);
      setUser(res.data);
    })
    .catch((err) => {
      console.error('❌ Gagal ambil user:', err);
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);


const login = async (email: string, password: string) => {
  await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie');
  await axios.post('/login', { email, password });
  const res = await axios.get('/auth/me');
  setUser(res.data);
};

const navigate = useNavigate();

const logout = async () => {
  try {
    await axios.post("/auth/logout");
    console.log("Logout sukses");
  } catch (err) {
    console.error("Logout gagal", err);
  } finally {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false);
    navigate("/login");
  }
};

  return (
    <AuthContext.Provider value={{ user,  login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
