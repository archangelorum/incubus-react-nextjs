import { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { redirect } from '@/i18n/navigation';
import { headers } from 'next/headers';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Shield, 
  Activity,
  ClipboardList,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';

interface AdminLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const locale = await getLocale();
  const t = await getTranslations('admin');
  
  // Check if user is authenticated and has admin role
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect( { href: '/', locale });
  }
  
  const navigationItems = [
    {
      name: t('navigation.dashboard'),
      href: `/admin`,
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: t('navigation.users'),
      href: `/admin/users`,
      icon: <Users className="w-5 h-5" />
    },
    {
      name: t('navigation.moderation'),
      href: `/admin/moderation`,
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: t('navigation.monitoring'),
      href: `/admin/monitoring`,
      icon: <Activity className="w-5 h-5" />
    },
    {
      name: t('navigation.analytics'),
      href: `/admin/analytics`,
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      name: t('navigation.auditLogs'),
      href: `/admin/audit-logs`,
      icon: <ClipboardList className="w-5 h-5" />
    },
    {
      name: t('navigation.notifications'),
      href: `/admin/notifications`,
      icon: <Bell className="w-5 h-5" />
    },
    {
      name: t('navigation.settings'),
      href: `/admin/settings`,
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 pt-16"> {/* Added pt-16 to account for main header height */}
      {/* Sidebar */}
      <AdminSidebar navigationItems={navigationItems} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}