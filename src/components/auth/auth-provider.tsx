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
  activeOrganizationId?: string | null;
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
  
  // Organization-related functions
  createOrganization: (data: { name: string; slug: string; logo?: string }) => Promise<any>;
  listOrganizations: () => Promise<any>;
  getActiveOrganization: () => Promise<any>;
  setActiveOrganization: (organizationId: string) => Promise<any>;
  getFullOrganization: (params?: { organizationId?: string; organizationSlug?: string }) => Promise<any>;
  updateOrganization: (data: { name?: string; logo?: string; slug?: string; metadata?: any }) => Promise<any>;
  deleteOrganization: (organizationId: string) => Promise<any>;
  
  // Organization members and invitations
  inviteMember: (data: { email: string; role: string }) => Promise<any>;
  acceptInvitation: (invitationId: string) => Promise<any>;
  cancelInvitation: (invitationId: string) => Promise<any>;
  rejectInvitation: (invitationId: string) => Promise<any>;
  getInvitation: (invitationId: string) => Promise<any>;
  removeMember: (memberIdOrEmail: string) => Promise<any>;
  updateMemberRole: (data: { memberId: string; role: string | string[] }) => Promise<any>;
  getActiveMember: () => Promise<any>;
  leaveOrganization: (organizationId: string) => Promise<any>;
  
  // Organization permissions
  checkOrganizationPermission: (permission: any) => Promise<boolean>;
  checkRolePermission: (params: { permission: any; role: string }) => Promise<boolean>;
};

const authProviders = {
  onetap: () => authClient.oneTap(),
  passkey: () => authClient.signIn.passkey(),
  google: () => authClient.signIn.social({ provider: "google" })
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialSession }: { children: React.ReactNode, initialSession?: any }) {
  // Add organization-related functions
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
      activeOrganizationId: initialSession.session.activeOrganizationId,
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
            activeOrganizationId: session.session.activeOrganizationId,
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
          activeOrganizationId: session.session.activeOrganizationId,
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

  // Organization-related functions
  const createOrganization = async (data: { name: string; slug: string; logo?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.create(data);
      return result;
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const listOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a hook, so we can't use it directly in a function
      // Instead, we'll use the direct API call
      const result = await authClient.organization.list();
      return result.data;
    } catch (err) {
      console.error('Error listing organizations:', err);
      setError('Failed to list organizations');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a simple implementation that returns the active organization
      // based on the user's activeOrganizationId
      if (user?.activeOrganizationId) {
        const orgs = await authClient.organization.list();
        return orgs.data?.find(org => org.id === user.activeOrganizationId) || null;
      }
      return null;
    } catch (err) {
      console.error('Error getting active organization:', err);
      setError('Failed to get active organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.setActive({
        organizationId
      });
      
      // Update the user state with the new active organization
      if (user) {
        setUser({
          ...user,
          activeOrganizationId: organizationId
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error setting active organization:', err);
      setError('Failed to set active organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFullOrganization = async (params?: { organizationId?: string; organizationSlug?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.getFullOrganization({
        query: params
      });
      return result;
    } catch (err) {
      console.error('Error getting organization details:', err);
      setError('Failed to get organization details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (data: { name?: string; logo?: string; slug?: string; metadata?: any }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.update({
        data
      });
      
      return result;
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.delete({
        organizationId
      });
      
      return result;
    } catch (err) {
      console.error('Error deleting organization:', err);
      setError('Failed to delete organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Organization members and invitations
  const inviteMember = async (data: { email: string; role: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert the string role to the expected type
      const role = data.role as "admin" | "member" | "owner" | "publisher";
      const result = await authClient.organization.inviteMember({
        email: data.email,
        role
      });
      return result;
    } catch (err) {
      console.error('Error inviting member:', err);
      setError('Failed to invite member');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.acceptInvitation({
        invitationId
      });
      
      return result;
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.cancelInvitation({
        invitationId
      });
      
      return result;
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setError('Failed to cancel invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.rejectInvitation({
        invitationId
      });
      
      return result;
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError('Failed to reject invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.getInvitation({
        query: {
          id: invitationId
        }
      });
      
      return result;
    } catch (err) {
      console.error('Error getting invitation:', err);
      setError('Failed to get invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberIdOrEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.removeMember({
        memberIdOrEmail
      });
      
      return result;
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (data: { memberId: string; role: string | string[] }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert the role to the expected type
      const role = data.role as "admin" | "member" | "owner" | "publisher" | ("admin" | "member" | "owner" | "publisher")[];
      const result = await authClient.organization.updateMemberRole({
        memberId: data.memberId,
        role
      });
      return result;
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveMember = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.getActiveMember();
      return result;
    } catch (err) {
      console.error('Error getting active member:', err);
      setError('Failed to get active member');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.organization.leave({
        organizationId
      });
      
      return result;
    } catch (err) {
      console.error('Error leaving organization:', err);
      setError('Failed to leave organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Organization permissions
  const checkOrganizationPermission = async (permission: any) => {
    try {
      if (!user) return false;
      
      const result = await authClient.organization.hasPermission({
        permission
      });
      
      return !!result;
    } catch (err) {
      console.error('Error checking organization permission:', err);
      return false;
    }
  };

  const checkRolePermission = async (params: { permission: any; role: string }) => {
    try {
      // Convert the role to the expected type
      const role = params.role as "admin" | "member" | "owner" | "publisher";
      const result = authClient.organization.checkRolePermission({
        permission: params.permission,
        role
      });
      return !!result;
    } catch (err) {
      console.error('Error checking role permission:', err);
      return false;
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
          activeOrganizationId: session.session.activeOrganizationId,
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
        
        // Organization-related functions
        createOrganization,
        listOrganizations,
        getActiveOrganization,
        setActiveOrganization,
        getFullOrganization,
        updateOrganization,
        deleteOrganization,
        
        // Organization members and invitations
        inviteMember,
        acceptInvitation,
        cancelInvitation,
        rejectInvitation,
        getInvitation,
        removeMember,
        updateMemberRole,
        getActiveMember,
        leaveOrganization,
        
        // Organization permissions
        checkOrganizationPermission,
        checkRolePermission,
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