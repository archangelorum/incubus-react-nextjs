'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

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

export function AcceptInvitationClient({ invitationId }: { invitationId: string }) {
  const auth = useAuth();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadInvitation();
    }
  }, [auth.isAuthenticated, invitationId]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const invitationData = await auth.getInvitation(invitationId);
      setInvitation(invitationData);
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation. It may have expired or been cancelled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setIsAccepting(true);
      
      await auth.acceptInvitation(invitationId);
      
      toast.success('Invitation accepted successfully');
      
      // Redirect to organizations page
      router.push('/organizations');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectInvitation = async () => {
    try {
      setIsAccepting(true);
      
      await auth.rejectInvitation(invitationId);
      
      toast.success('Invitation rejected');
      
      // Redirect to organizations page
      router.push('/organizations');
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      toast.error('Failed to reject invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-500 mb-4">
              Please sign in to accept this invitation.
            </p>
            <button
              onClick={() => auth.signIn('google')}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Loading Invitation</h2>
            <p className="text-gray-500">
              Please wait while we load your invitation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Invitation Error</h2>
            <p className="text-red-500 mb-4">
              {error || 'Invitation not found'}
            </p>
            <button
              onClick={() => router.push('/organizations')}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Organizations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Organization Invitation</h2>
          
          <div className="flex items-center mb-6">
            {invitation.organization.logo ? (
              <img
                src={invitation.organization.logo}
                alt={invitation.organization.name}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="text-2xl text-gray-500">{invitation.organization.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="font-medium text-lg">{invitation.organization.name}</p>
              <p className="text-gray-500">@{invitation.organization.slug}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700">
              You have been invited to join <strong>{invitation.organization.name}</strong> as a <strong>{invitation.role}</strong>.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This invitation will expire on {new Date(invitation.expiresAt).toLocaleDateString()}.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleAcceptInvitation}
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isAccepting}
            >
              {isAccepting ? 'Accepting...' : 'Accept Invitation'}
            </button>
            <button
              onClick={handleRejectInvitation}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isAccepting}
            >
              {isAccepting ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}