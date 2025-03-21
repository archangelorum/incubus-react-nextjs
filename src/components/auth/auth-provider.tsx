'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { data: session, error } = await authClient.getSession(); 
        if (session) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: String(session.user.image),
            role: String(session.user.role),
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (provider: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.social({
        provider: provider as "google" | "discord" | "github"
      });
    } catch (err) {
      console.error(`Failed to sign in with ${provider}:`, err);
      setError(`Failed to sign in with ${provider}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signOut();
      setUser(null);
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        error,
      }}
    >
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