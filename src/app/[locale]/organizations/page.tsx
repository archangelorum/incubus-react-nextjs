import { getTranslations } from 'next-intl/server';
import { Building2 } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { OrganizationDetails } from '@/components/organization/organization-details';
import { PendingInvitations } from '@/components/organization/pending-invitations';

export default async function OrganizationsPage() {
  const t = await getTranslations();
  
  return (
    <div className="pt-24">
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Organizations</h1>
            </div>
            <OrganizationSwitcher />
          </div>
          <p className="mt-4 text-muted-foreground max-w-3xl">
            Manage your game publishing organizations, invite team members, and control access permissions.
          </p>
        </div>
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <OrganizationDetails />
            </div>
          </div>
          <div>
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <PendingInvitations />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}