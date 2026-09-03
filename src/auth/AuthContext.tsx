import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Customer, Admin } from '../types/database';
import { api } from '../api/client';

export interface RegisterPayload {
  fullName?: string;
  name?: string;
  email: string;
  username?: string;
  password: string;
  mobileNo?: string;
  phone?: string;
  instagramHandle?: string;
}

interface AuthContextType {
  user: User | null;
  customerProfile: Customer | null;
  adminProfile: Admin | null;
  isLoading: boolean;
  login: (emailOrLogin: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        setCustomerProfile(res.customerProfile || null);
        setAdminProfile(res.adminProfile || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (emailOrLogin: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(emailOrLogin, password);
      setUser(res.user);
      setCustomerProfile(res.customerProfile || null);
      setAdminProfile(res.adminProfile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setCustomerProfile(res.customerProfile || null);
      setAdminProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setCustomerProfile(null);
    setAdminProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        setCustomerProfile(res.customerProfile || null);
        setAdminProfile(res.adminProfile || null);
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        adminProfile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
