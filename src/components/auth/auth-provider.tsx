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

type SignInProviders = "onetap" | "passkey" | "google"

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (provider: SignInProviders) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const authProviders = {
  onetap: () => authClient.oneTap(),
  passkey: () => authClient.signIn.passkey(),
  google: () => authClient.signIn.social({ provider: "google" })
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialSession }: { children: React.ReactNode, initialSession?: any }) {
  const [user, setUser] = useState<User | null>(
    initialSession?.user ? {
      id: initialSession.user.id,
      name: initialSession.user.name,
      email: initialSession.user.email,
      image: String(initialSession.user.image),
      role: String(initialSession.user.role),
    } : null
  );
  const [isLoading, setIsLoading] = useState(!initialSession);
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

    if (!initialSession) initAuth();
  }, [initialSession]);

  const signIn = async (provider: SignInProviders) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authMethod = authProviders[provider];
      if (!authMethod) {
        throw new Error(`Unsupported authentication provider: ${provider}`);
      }
      
      await authMethod();
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