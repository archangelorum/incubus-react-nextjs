'use client';

import { useState } from 'react';
import { useOrganization } from './organization-provider';
import { toast } from 'sonner';

export function CreateOrganizationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { createOrganization, isLoading } = useOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    try {
      await createOrganization({ name, slug, logo: logo || undefined });
      setName('');
      setSlug('');
      setLogo('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the organization provider
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Auto-generate slug from name if slug is empty
    if (!slug) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Organization Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Game Studio Name"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="slug" className="block text-sm font-medium text-foreground">
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
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          This will be used in URLs: {slug ? `https://example.com/publishers/${slug}` : ''}
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="logo" className="block text-sm font-medium text-foreground">
          Logo URL (optional)
        </label>
        <input
          id="logo"
          type="url"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="https://example.com/logo.png"
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
        disabled={isLoading || !name || !slug}
      >
        {isLoading ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  );
}