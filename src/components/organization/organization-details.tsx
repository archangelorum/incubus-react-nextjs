'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from './organization-provider';
import { MembersList } from './members-list';
import { InviteMemberForm } from './invite-member-form';
import { OrganizationSettings } from './organization-settings';
import { Building2, Users, UserPlus, Settings } from 'lucide-react';

export function OrganizationDetails() {
  const { activeOrganization, isLoading, hasPermission } = useOrganization();
  const [activeTab, setActiveTab] = useState('members');
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  
  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const canInvite = await hasPermission({ invitation: ['create'] });
      setCanInviteMembers(canInvite);
    };
    
    checkPermissions();
  }, [hasPermission]);
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 bg-primary/20 rounded w-48 mb-2"></div>
          <div className="h-3 bg-primary/10 rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  if (!activeOrganization) {
    return (
      <div className="p-8 text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No active organization selected</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Please select an organization from the dropdown or create a new one to manage your game publishing activities.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          {activeOrganization.logo ? (
            <img
              src={activeOrganization.logo}
              alt={activeOrganization.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{activeOrganization.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{activeOrganization.name}</h2>
            <p className="text-muted-foreground">@{activeOrganization.slug}</p>
          </div>
        </div>
      </div>
      
      <div className="border-b border-border">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Members
          </button>
          
          {canInviteMembers && (
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'invite'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'members' && <MembersList />}
        {activeTab === 'invite' && <InviteMemberForm />}
        {activeTab === 'settings' && <OrganizationSettings />}
      </div>
    </div>
  );
}