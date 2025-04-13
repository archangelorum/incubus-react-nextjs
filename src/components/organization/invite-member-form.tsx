'use client';

import { useState } from 'react';
import { useOrganization } from './organization-provider';
import { toast } from 'sonner';
import { UserPlus, Info } from 'lucide-react';

export function InviteMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const { inviteMember, isLoading, activeOrganization } = useOrganization();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    if (!activeOrganization) {
      toast.error('No active organization selected');
      return;
    }
    
    try {
      await inviteMember({ email, role });
      setEmail('');
      setRole('member');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the organization provider
    }
  };

  if (!activeOrganization) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active organization selected.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-primary" />
          Invite Team Member
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Invite a team member to join your organization. They will receive an email with instructions to accept the invitation.
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="colleague@example.com"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-medium text-foreground">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="publisher">Publisher</option>
        </select>
        
        <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10 flex">
          <Info className="w-5 h-5 text-primary mr-2 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {role === 'admin' && 'Admins can manage members and organization settings, including inviting new members and changing roles.'}
            {role === 'member' && 'Members can view and contribute to the organization but cannot manage members or change organization settings.'}
            {role === 'publisher' && 'Publishers can manage games and in-game assets, including creating, updating, and publishing games.'}
          </p>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
        disabled={isLoading || !email}
      >
        {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
      </button>
    </form>
  );
}