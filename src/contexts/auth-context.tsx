
"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '@/lib/mock-data'; // Using mock users

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, role?: 'voter' | 'admin') => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isVoter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('voteWiseUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Additional check to ensure the stored user structure is valid
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
           setUser(parsedUser);
        } else {
          localStorage.removeItem('voteWiseUser');
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('voteWiseUser');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string, roleFromLoginAttempt?: 'voter' | 'admin'): Promise<User | null> => {
    setLoading(true);
    // Simulate API call for login
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const normalizedEmail = email.toLowerCase();
    // Find user by email first
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (foundUser) {
      // Check password
      if (foundUser.password !== password) {
        setLoading(false);
        console.warn(`Mock login: Password incorrect for ${email}.`);
        return null;
      }

      // Check role if specified during login attempt
      if (roleFromLoginAttempt && foundUser.role !== roleFromLoginAttempt) {
          setLoading(false);
          console.warn(`Mock login: User ${email} exists but not with role ${roleFromLoginAttempt}.`);
          return null;
      }
      
      // Ensure user is marked as verified for mock purposes
      const loggedInUser = { ...foundUser, isVerified: foundUser.isVerified !== undefined ? foundUser.isVerified : true };
      
      setUser(loggedInUser);
      localStorage.setItem('voteWiseUser', JSON.stringify(loggedInUser));
      setLoading(false);
      return loggedInUser;
    }
    
    // User not found
    console.warn(`Mock login: User ${normalizedEmail} not found.`);
    setLoading(false);
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('voteWiseUser');
    // Optionally redirect or perform other cleanup
  };

  const isAdmin = !!(user && user.role === 'admin' && user.isVerified);
  const isVoter = !!(user && user.role === 'voter' && user.isVerified);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isVoter }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

