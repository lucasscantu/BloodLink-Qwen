import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { users, institutions } from '../data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloodlink_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulated authentication - in production this would call the backend API
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      const userWithInst = foundUser.institutionId
        ? { ...foundUser, institution: institutions.find(i => i.id === foundUser.institutionId) }
        : foundUser;
      setUser(userWithInst);
      localStorage.setItem('bloodlink_user', JSON.stringify(userWithInst));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bloodlink_user');
  }, []);

  const hasRole = useCallback((...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
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
