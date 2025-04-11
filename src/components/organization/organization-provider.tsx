'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from 'sonner';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string | Date;
  metadata?: any;
};

type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string | Date;
  organizationId: string;
  organization: Organization;
  inviterId: string;
  inviter: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  };
};

type OrganizationContextType = {
  organizations: Organization[];
  activeOrganization: Organization | null;
  members: Member[];
  invitations: Invitation[];
  isLoading: boolean;
  error: string | null;
  
  // Organization management
  createOrganization: (data: { name: string; slug: string; logo?: string }) => Promise<void>;
  setActiveOrganization: (organizationId: string) => Promise<void>;
  updateOrganization: (data: { name?: string; logo?: string; slug?: string; metadata?: any }) => Promise<void>;
  deleteOrganization: () => Promise<void>;
  
  // Member management
  inviteMember: (data: { email: string; role: string }) => Promise<void>;
  removeMember: (memberIdOrEmail: string) => Promise<void>;
  updateMemberRole: (data: { memberId: string; role: string }) => Promise<void>;
  leaveOrganization: () => Promise<void>;
  
  // Invitation management
  acceptInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  
  // Permissions
  hasPermission: (permission: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load organizations and active organization on mount
  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshData();
    }
  }, [auth.isAuthenticated, auth.user?.activeOrganizationId]);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load organizations
      const orgs = await auth.listOrganizations();
      setOrganizations(orgs || []);
      
      // Load active organization
      const active = await auth.getActiveOrganization();
      setActiveOrganizationState(active);
      
      // If we have an active organization, load members and invitations
      if (active) {
        const orgDetails = await auth.getFullOrganization();
        setMembers(orgDetails?.members || []);
        setInvitations(orgDetails?.invitations || []);
      } else {
        setMembers([]);
        setInvitations([]);
      }
    } catch (err) {
      console.error('Error loading organization data:', err);
      setError('Failed to load organization data');
    } finally {
      setIsLoading(false);
    }
  };

  // Organization management functions
  const createOrganization = async (data: { name: string; slug: string; logo?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.createOrganization(data);
      await refreshData();
      
      toast.success('Organization created successfully');
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization');
      toast.error('Failed to create organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.setActiveOrganization(organizationId);
      await refreshData();
      
      toast.success('Active organization changed');
    } catch (err) {
      console.error('Error setting active organization:', err);
      setError('Failed to set active organization');
      toast.error('Failed to set active organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (data: { name?: string; logo?: string; slug?: string; metadata?: any }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.updateOrganization(data);
      await refreshData();
      
      toast.success('Organization updated successfully');
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization');
      toast.error('Failed to update organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrganization = async () => {
    try {
      if (!activeOrganization) {
        throw new Error('No active organization');
      }
      
      setIsLoading(true);
      setError(null);
      
      await auth.deleteOrganization(activeOrganization.id);
      await refreshData();
      
      toast.success('Organization deleted successfully');
    } catch (err) {
      console.error('Error deleting organization:', err);
      setError('Failed to delete organization');
      toast.error('Failed to delete organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Member management functions
  const inviteMember = async (data: { email: string; role: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.inviteMember(data);
      await refreshData();
      
      toast.success(`Invitation sent to ${data.email}`);
    } catch (err) {
      console.error('Error inviting member:', err);
      setError('Failed to invite member');
      toast.error('Failed to invite member');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberIdOrEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.removeMember(memberIdOrEmail);
      await refreshData();
      
      toast.success('Member removed successfully');
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
      toast.error('Failed to remove member');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (data: { memberId: string; role: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.updateMemberRole(data);
      await refreshData();
      
      toast.success('Member role updated successfully');
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role');
      toast.error('Failed to update member role');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveOrganization = async () => {
    try {
      if (!activeOrganization) {
        throw new Error('No active organization');
      }
      
      setIsLoading(true);
      setError(null);
      
      await auth.leaveOrganization(activeOrganization.id);
      await refreshData();
      
      toast.success('Left organization successfully');
    } catch (err) {
      console.error('Error leaving organization:', err);
      setError('Failed to leave organization');
      toast.error('Failed to leave organization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Invitation management functions
  const acceptInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.acceptInvitation(invitationId);
      await refreshData();
      
      toast.success('Invitation accepted successfully');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
      toast.error('Failed to accept invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.cancelInvitation(invitationId);
      await refreshData();
      
      toast.success('Invitation cancelled successfully');
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      setError('Failed to cancel invitation');
      toast.error('Failed to cancel invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.rejectInvitation(invitationId);
      await refreshData();
      
      toast.success('Invitation rejected successfully');
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError('Failed to reject invitation');
      toast.error('Failed to reject invitation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Permission check
  const hasPermission = async (permission: any) => {
    try {
      return await auth.checkOrganizationPermission(permission);
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        members,
        invitations,
        isLoading,
        error,
        
        // Organization management
        createOrganization,
        setActiveOrganization,
        updateOrganization,
        deleteOrganization,
        
        // Member management
        inviteMember,
        removeMember,
        updateMemberRole,
        leaveOrganization,
        
        // Invitation management
        acceptInvitation,
        cancelInvitation,
        rejectInvitation,
        
        // Permissions
        hasPermission,
        refreshData,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}