import { useState } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
}

export function useAuth() {
  const stored = localStorage.getItem('user');
  const [user, setUser] = useState<User | null>(
    stored ? JSON.parse(stored) : null
  );
  const loading = false;

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
}