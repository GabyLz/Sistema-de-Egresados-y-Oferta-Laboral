'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'egresado' | 'empresa';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: Role | null;
  userName: string | null;
  userId: string | null;
  login: (token: string, role: Role, name: string, id: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');

    if (token && role) {
      setIsLoggedIn(true);
      // Normalizar el rol a minúsculas para asegurar coincidencia con los tipos
      setUserRole(role.toLowerCase() as Role);
      setUserName(name);
      setUserId(id);
    }
    setLoading(false);
  }, []);

  const login = (token: string, role: string, name: string, id: string) => {
    const normalizedRole = role.toLowerCase() as Role;
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', normalizedRole);
    localStorage.setItem('userName', name);
    localStorage.setItem('userId', id);
    setIsLoggedIn(true);
    setUserRole(normalizedRole);
    setUserName(name);
    setUserId(id);
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
