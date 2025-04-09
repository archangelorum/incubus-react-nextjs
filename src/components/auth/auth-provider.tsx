'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: string | Date;
  impersonatedBy?: string | null;
};

type SignInProviders = "onetap" | "passkey" | "google"

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (provider: SignInProviders) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  
  // Admin-related functions
  isAdmin: () => boolean;
  isImpersonating: () => boolean;
  hasPermission: (permission: any) => Promise<boolean>;
  
  // Admin user management
  createUser: (userData: { name: string; email: string; password: string; role?: string; data?: any }) => Promise<any>;
  setUserRole: (userId: string, role: string) => Promise<any>;
  banUser: (userId: string, banReason?: string, banExpiresIn?: number) => Promise<any>;
  unbanUser: (userId: string) => Promise<any>;
  removeUser: (userId: string) => Promise<any>;
  
  // Admin session management
  listUserSessions: (userId: string) => Promise<any>;
  revokeUserSession: (sessionToken: string) => Promise<any>;
  revokeUserSessions: (userId: string) => Promise<any>;
  
  // Admin impersonation
  impersonateUser: (userId: string) => Promise<any>;
  stopImpersonating: () => Promise<any>;
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
      image: initialSession.user.image ? String(initialSession.user.image) : undefined,
      role: initialSession.user.role ? String(initialSession.user.role) : undefined,
      banned: initialSession.user.banned || false,
      banReason: initialSession.user.banReason,
      banExpires: initialSession.user.banExpires,
      impersonatedBy: initialSession.session.impersonatedBy,
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
            image: session.user.image ? String(session.user.image) : undefined,
            role: session.user.role ? String(session.user.role) : undefined,
            banned: session.user.banned || false,
            banReason: session.user.banReason ? String(session.user.banReason) : undefined,
            banExpires: session.user.banExpires || undefined,
            impersonatedBy: session.session.impersonatedBy,
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
  });

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

  // Admin helper functions
  const isAdmin = () => {
    return !!user && user.role === 'admin';
  };

  const isImpersonating = () => {
    return !!user && !!user.impersonatedBy;
  };

  const hasPermission = async (permission: any) => {
    try {
      if (!user) return false;
      
      const result = await authClient.admin.hasPermission({
        permission
      });
      
      return !!result;
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  };

  // Admin user management functions
  const createUser = async (userData: { name: string; email: string; password: string; role?: string; data?: any }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure role is provided as required by the API
      const userDataWithRole = {
        ...userData,
        role: userData.role || 'user' // Default to 'user' if not provided
      };
      
      const result = await authClient.admin.createUser(userDataWithRole);
      return result;
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserRole = async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.setRole({
        userId,
        role
      });
      
      return result;
    } catch (err) {
      console.error('Error setting user role:', err);
      setError('Failed to set user role');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, banReason?: string, banExpiresIn?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.banUser({
        userId,
        banReason,
        banExpiresIn
      });
      
      return result;
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.unbanUser({
        userId
      });
      
      return result;
    } catch (err) {
      console.error('Error unbanning user:', err);
      setError('Failed to unban user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.removeUser({
        userId
      });
      
      return result;
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin session management functions
  const listUserSessions = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.listUserSessions({
        userId
      });
      
      return result.data?.sessions;
    } catch (err) {
      console.error('Error listing user sessions:', err);
      setError('Failed to list user sessions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeUserSession = async (sessionToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.revokeUserSession({
        sessionToken
      });
      
      return result;
    } catch (err) {
      console.error('Error revoking user session:', err);
      setError('Failed to revoke user session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeUserSessions = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.revokeUserSessions({
        userId
      });
      
      return result;
    } catch (err) {
      console.error('Error revoking user sessions:', err);
      setError('Failed to revoke user sessions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin impersonation functions
  const impersonateUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.impersonateUser({
        userId
      });
      
      // Refresh the session after impersonation
      const { data: session } = await authClient.getSession();
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ? String(session.user.image) : undefined,
          role: session.user.role ? String(session.user.role) : undefined,
          banned: session.user.banned || false,
          banReason: session.user.banReason ? String(session.user.banReason) : undefined,
          banExpires: session.user.banExpires || undefined,
          impersonatedBy: session.session.impersonatedBy,
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error impersonating user:', err);
      setError('Failed to impersonate user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopImpersonating = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.admin.stopImpersonating();
      
      // Refresh the session after stopping impersonation
      const { data: session } = await authClient.getSession();
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ? String(session.user.image) : undefined,
          role: session.user.role ? String(session.user.role) : undefined,
          banned: session.user.banned || false,
          banReason: session.user.banReason ? String(session.user.banReason) : undefined,
          banExpires: session.user.banExpires || undefined,
          impersonatedBy: undefined,
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error stopping impersonation:', err);
      setError('Failed to stop impersonation');
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
        
        // Admin functions
        isAdmin,
        isImpersonating,
        hasPermission,
        
        // Admin user management
        createUser,
        setUserRole,
        banUser,
        unbanUser,
        removeUser,
        
        // Admin session management
        listUserSessions,
        revokeUserSession,
        revokeUserSessions,
        
        // Admin impersonation
        impersonateUser,
        stopImpersonating,
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