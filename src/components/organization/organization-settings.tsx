'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from './organization-provider';
import { toast } from 'sonner';
import { Settings, AlertTriangle, Building2, Link2, Image } from 'lucide-react';

export function OrganizationSettings() {
  const { activeOrganization, updateOrganization, deleteOrganization, isLoading, hasPermission } = useOrganization();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [canUpdateOrg, setCanUpdateOrg] = useState(false);
  const [canDeleteOrg, setCanDeleteOrg] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Load organization data when active organization changes
  useEffect(() => {
    if (activeOrganization) {
      setName(activeOrganization.name);
      setSlug(activeOrganization.slug);
      setLogo(activeOrganization.logo || '');
    }
  }, [activeOrganization]);
  
  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const canUpdate = await hasPermission({ organization: ['update'] });
      const canDelete = await hasPermission({ organization: ['delete'] });
      
      setCanUpdateOrg(canUpdate);
      setCanDeleteOrg(canDelete);
    };
    
    checkPermissions();
  }, [hasPermission, activeOrganization]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeOrganization) {
      toast.error('No active organization selected');
      return;
    }
    
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    try {
      await updateOrganization({
        name,
        slug,
        logo: logo || undefined
      });
      toast.success('Organization settings updated successfully');
    } catch (error) {
      // Error is already handled in the organization provider
    }
  };
  
  const handleDelete = async () => {
    if (!activeOrganization) {
      toast.error('No active organization selected');
      return;
    }
    
    if (deleteConfirmation !== activeOrganization.name) {
      toast.error('Confirmation text does not match organization name');
      return;
    }
    
    try {
      await deleteOrganization();
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary" />
          Organization Settings
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your organization's profile and settings.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="flex items-center text-sm font-medium text-foreground">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            Organization Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Game Studio Name"
            required
            disabled={isLoading || !canUpdateOrg}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="slug" className="flex items-center text-sm font-medium text-foreground">
            <Link2 className="w-4 h-4 mr-2 text-muted-foreground" />
            Organization Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="game-studio-name"
            required
            disabled={isLoading || !canUpdateOrg}
          />
          <p className="text-xs text-muted-foreground">
            This will be used in URLs: {slug ? `https://example.com/publishers/${slug}` : ''}
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="logo" className="flex items-center text-sm font-medium text-foreground">
            <Image className="w-4 h-4 mr-2 text-muted-foreground" />
            Logo URL
          </label>
          <input
            id="logo"
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="https://example.com/logo.png"
            disabled={isLoading || !canUpdateOrg}
          />
        </div>
        
        {canUpdateOrg && (
          <button
            type="submit"
            className="px-4 py-2 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
            disabled={isLoading || !name || !slug}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
      
      {canDeleteOrg && (
        <div className="border-t border-[hsl(var(--border))] pt-6">
          <h3 className="text-lg font-medium text-destructive flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </h3>
          <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Once you delete an organization, there is no going back. All data associated with this organization will be permanently removed.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 text-destructive-foreground bg-destructive rounded-md hover:bg-destructive/90 focus:outline-hidden focus:ring-2 focus:ring-destructive focus:ring-offset-2 transition-colors"
          >
            Delete Organization
          </button>
          
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-card rounded-lg shadow-xl overflow-hidden w-full max-w-md border border-[hsl(var(--border))]">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="shrink-0 bg-destructive/10 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Delete Organization
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this organization? All data associated with this organization will be permanently removed. This action cannot be undone.
                          </p>
                          <div className="mt-4">
                            <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
                              Please type <span className="font-semibold">{activeOrganization.name}</span> to confirm
                            </label>
                            <input
                              type="text"
                              id="confirm"
                              className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md bg-background text-foreground py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-destructive focus:border-destructive"
                              value={deleteConfirmation}
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted px-6 py-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-background text-foreground hover:bg-accent/5 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeleteConfirmation('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-hidden focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      onClick={handleDelete}
                      disabled={deleteConfirmation !== activeOrganization.name || isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}