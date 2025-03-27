'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';

interface ModerationTabsProps {
  activeTab: string;
}

export function ModerationTabs({ activeTab }: ModerationTabsProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams object to preserve other query parameters
  const createQueryString = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    
    // Reset page when changing tabs
    if (params.has('page')) {
      params.set('page', '1');
    }
    
    return params.toString();
  };

  const tabs = [
    {
      id: 'reviews',
      label: t('moderation.tabs.reviews'),
      icon: <Shield className="w-4 h-4 mr-2" />
    },
    {
      id: 'reports',
      label: t('moderation.tabs.reports'),
      icon: <AlertTriangle className="w-4 h-4 mr-2" />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`${pathname}?${createQueryString(tab.id)}`}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${
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