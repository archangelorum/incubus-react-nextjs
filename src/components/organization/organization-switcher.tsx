'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrganization } from './organization-provider';
import { CreateOrganizationForm } from './create-organization-form';
import { toast } from 'sonner';
import { Building2, ChevronDown, Plus } from 'lucide-react';

export function OrganizationSwitcher() {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      await setActiveOrganization(organizationId);
      setIsDropdownOpen(false);
    } catch (error) {
      // Error is already handled in the organization provider
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 bg-background text-sm font-medium hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        id="organization-menu"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        disabled={isLoading}
      >
        {activeOrganization ? (
          <span className="flex items-center">
            {activeOrganization.logo ? (
              <img
                src={activeOrganization.logo}
                alt={activeOrganization.name}
                className="h-6 w-6 rounded-full mr-2"
              />
            ) : (
              <Building2 className="h-5 w-5 mr-2 text-primary" />
            )}
            <span className="max-w-[150px] truncate">{activeOrganization.name}</span>
          </span>
        ) : (
          <span className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary" />
            Select Organization
          </span>
        )}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="organization-menu">
            {organizations.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">No organizations found</div>
            ) : (
              organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrganization(org.id)}
                  className={`${
                    activeOrganization?.id === org.id
                      ? 'bg-accent/10 text-primary'
                      : 'text-foreground'
                  } flex items-center w-full px-4 py-2 text-sm hover:bg-accent/5 transition-colors`}
                  role="menuitem"
                >
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="h-5 w-5 rounded-full mr-2"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  <span className="truncate">{org.name}</span>
                </button>
              ))
            )}
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-primary hover:bg-accent/5 transition-colors"
                role="menuitem"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-card rounded-lg shadow-xl overflow-hidden w-full max-w-md border border-border">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Create New Organization
                </h3>
                <CreateOrganizationForm
                  onSuccess={() => {
                    setIsCreateModalOpen(false);
                    toast.success('Organization created successfully');
                  }}
                />
              </div>
              <div className="bg-muted px-6 py-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-border bg-background text-foreground hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}