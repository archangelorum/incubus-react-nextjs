'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield
} from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams object to preserve other query parameters
  const createQueryString = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    return params.toString();
  };

  const tabs = [
    {
      id: 'system',
      label: t('settings.tabs.system'),
      icon: <Settings className="w-4 h-4 mr-2" />
    },
    {
      id: 'notifications',
      label: t('settings.tabs.notifications'),
      icon: <Bell className="w-4 h-4 mr-2" />
    },
    {
      id: 'integrations',
      label: t('settings.tabs.integrations'),
      icon: <Globe className="w-4 h-4 mr-2" />
    },
    {
      id: 'permissions',
      label: t('settings.tabs.permissions'),
      icon: <Shield className="w-4 h-4 mr-2" />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`${pathname}?${createQueryString(tab.id)}`}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}