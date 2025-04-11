'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from 'sonner';
import { Inbox, Check, X, Building2, Clock } from 'lucide-react';

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string | Date;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
};

export function PendingInvitations() {
  const auth = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadInvitations();
    }
  }, [auth.isAuthenticated]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a placeholder - in a real implementation, you would have an API endpoint to get pending invitations
      // For now, we'll just simulate it with an empty array
      const pendingInvitations: Invitation[] = [];
      setInvitations(pendingInvitations);
    } catch (err) {
      console.error('Error loading invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      
      await auth.acceptInvitation(invitationId);
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast.success('Invitation accepted successfully');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error('Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      
      await auth.rejectInvitation(invitationId);
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast.success('Invitation rejected');
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      toast.error('Failed to reject invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center">
          <Inbox className="w-5 h-5 mr-2 text-primary" />
          Pending Invitations
        </h3>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-primary/10 rounded"></div>
            <div className="h-12 bg-primary/10 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive">
            <p>{error}</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-base font-medium mb-2">No pending invitations</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When you're invited to join an organization, it will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {invitation.organization.logo ? (
                      <img
                        src={invitation.organization.logo}
                        alt={invitation.organization.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{invitation.organization.name}</p>
                      <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={isLoading}
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.id)}
                      className="p-2 text-destructive bg-destructive/10 rounded-full hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={isLoading}
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}