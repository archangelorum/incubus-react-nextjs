'use client';

import { OrganizationSwitcher } from './organization-switcher';
import { OrganizationDetails } from './organization-details';
import { PendingInvitations } from './pending-invitations';
import { useAuth } from '@/components/auth/auth-provider';

export function OrganizationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-500">
            Please sign in to access your organizations.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <OrganizationSwitcher />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <OrganizationDetails />
        </div>
        <div>
          <PendingInvitations />
        </div>
      </div>
    </div>
  );
}