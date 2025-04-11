'use client';

import { useState, useEffect, useRef } from 'react';
import { useOrganization } from './organization-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from 'sonner';
import { Users, MoreVertical, UserCheck, UserMinus, Clock, Mail, Shield, Gamepad2 } from 'lucide-react';

export function MembersList() {
  const { members, invitations, removeMember, updateMemberRole, cancelInvitation, isLoading, hasPermission, activeOrganization } = useOrganization();
  const { user } = useAuth();
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [expandedInvitationId, setExpandedInvitationId] = useState<string | null>(null);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedMemberId(null);
        setExpandedInvitationId(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const canManage = await hasPermission({ member: ['update', 'delete'] });
      setCanManageMembers(canManage);
    };
    
    checkPermissions();
  }, [hasPermission]);
  
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      try {
        await removeMember(memberId);
      } catch (error) {
        // Error is already handled in the organization provider
      }
    }
  };
  
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole({ memberId, role: newRole });
      setExpandedMemberId(null);
    } catch (error) {
      // Error is already handled in the organization provider
    }
  };
  
  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (window.confirm(`Are you sure you want to cancel the invitation to ${email}?`)) {
      try {
        await cancelInvitation(invitationId);
      } catch (error) {
        // Error is already handled in the organization provider
      }
    }
  };
  
  if (!activeOrganization) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active organization selected.</p>
      </div>
    );
  }
  
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'owner':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-primary" />;
      case 'publisher':
        return <Gamepad2 className="w-4 h-4 text-green-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary" />
          Members
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-primary/10 rounded"></div>
            <div className="h-16 bg-primary/10 rounded"></div>
            <div className="h-16 bg-primary/10 rounded"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-md border border-border">
            <p className="text-muted-foreground">No members found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.id} className="py-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">{member.user.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium flex items-center">
                        {member.user.name}
                        {member.user.id === user?.id && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        {getRoleIcon(member.role)}
                        <span className="ml-1 font-medium capitalize">{member.role}</span>
                      </p>
                    </div>
                  </div>
                  
                  {canManageMembers && member.user.id !== user?.id && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Member options"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                      
                      {expandedMemberId === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => handleUpdateRole(member.id, 'admin')}
                              className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-accent/5 transition-colors ${
                                member.role === 'admin' ? 'text-muted-foreground' : 'text-foreground'
                              }`}
                              disabled={member.role === 'admin'}
                            >
                              <Shield className="w-4 h-4 mr-2 text-primary" />
                              Make Admin
                            </button>
                            <button
                              onClick={() => handleUpdateRole(member.id, 'member')}
                              className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-accent/5 transition-colors ${
                                member.role === 'member' ? 'text-muted-foreground' : 'text-foreground'
                              }`}
                              disabled={member.role === 'member'}
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                              Make Member
                            </button>
                            <button
                              onClick={() => handleUpdateRole(member.id, 'publisher')}
                              className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-accent/5 transition-colors ${
                                member.role === 'publisher' ? 'text-muted-foreground' : 'text-foreground'
                              }`}
                              disabled={member.role === 'publisher'}
                            >
                              <Gamepad2 className="w-4 h-4 mr-2 text-green-500" />
                              Make Publisher
                            </button>
                            <div className="border-t border-border my-1"></div>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.user.name)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {invitations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary" />
            Pending Invitations
          </h3>
          <ul className="divide-y divide-border">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="py-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      {getRoleIcon(invitation.role)}
                      <span className="ml-1 font-medium capitalize">{invitation.role}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {canManageMembers && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setExpandedInvitationId(expandedInvitationId === invitation.id ? null : invitation.id)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Invitation options"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                      
                      {expandedInvitationId === invitation.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Cancel Invitation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}