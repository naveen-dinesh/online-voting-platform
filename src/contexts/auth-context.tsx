
"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '@/lib/mock-data'; // Using mock users

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: 'voter' | 'admin') => Promise<User | null>;
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

  const login = async (email: string, roleFromLoginAttempt?: 'voter' | 'admin'): Promise<User | null> => {
    setLoading(true);
    // Simulate API call for login
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const normalizedEmail = email.toLowerCase();
    let foundUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail && (!roleFromLoginAttempt || u.role === roleFromLoginAttempt));

    // If user not found with specific role, but email exists with other role, and no specific role was requested for login, use first found.
    if (!foundUser && !roleFromLoginAttempt) {
        foundUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    }

    if (foundUser) {
      // Ensure user is marked as verified for mock purposes if they exist in mockUsers
      // unless explicitly set to isVerified: false in mockUsers
      const loggedInUser = { ...foundUser, isVerified: foundUser.isVerified !== undefined ? foundUser.isVerified : true };
      
      // If trying to log in as admin but user is voter, or vice-versa deny, unless this specific combo exists
      if (roleFromLoginAttempt && loggedInUser.role !== roleFromLoginAttempt) {
          setLoading(false);
          console.warn(`Mock login: User ${email} exists but not with role ${roleFromLoginAttempt}.`);
          return null;
      }
      
      setUser(loggedInUser);
      localStorage.setItem('voteWiseUser', JSON.stringify(loggedInUser));
      setLoading(false);
      return loggedInUser;
    }
    
    // If user not found, create a mock voter user for demo purposes if role is not admin
    // or if no role was specified (defaults to voter)
    if (!roleFromLoginAttempt || roleFromLoginAttempt === 'voter') {
        console.warn(`Mock login: User ${normalizedEmail} not found. Creating mock voter.`);
        const newUser: User = {
            id: `mock-user-${Date.now()}`,
            email: normalizedEmail,
            role: 'voter',
            isVerified: true, // auto-verify for mock new users
            name: normalizedEmail.split('@')[0] || `Voter ${Date.now().toString().slice(-4)}`,
        };
        setUser(newUser);
        localStorage.setItem('voteWiseUser', JSON.stringify(newUser));
        setLoading(false);
        return newUser;
    }

    // If trying to login as admin and user not found
    if (roleFromLoginAttempt === 'admin') {
        console.warn(`Mock login: Admin user ${normalizedEmail} not found.`);
    }

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
