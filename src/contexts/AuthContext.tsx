"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: 인증 상태 감지 시작');
    const unsubscribe = onAuthStateChange((user) => {
      console.log('AuthProvider: 인증 상태 변경됨', { 
        user: user ? { 
          email: user.email, 
          displayName: user.displayName, 
          role: user.role 
        } : null 
      });
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: 인증 상태 감지 종료');
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isAuthenticated: user !== null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 