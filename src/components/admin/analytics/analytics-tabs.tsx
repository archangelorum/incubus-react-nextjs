'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  GamepadIcon, 
  FileText
} from 'lucide-react';

interface AnalyticsTabsProps {
  activeTab: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

export function AnalyticsTabs({ activeTab, period, startDate, endDate }: AnalyticsTabsProps) {
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
      id: 'overview',
      label: t('analytics.tabs.overview'),
      icon: <BarChart3 className="w-4 h-4 mr-2" />
    },
    {
      id: 'users',
      label: t('analytics.tabs.users'),
      icon: <Users className="w-4 h-4 mr-2" />
    },
    {
      id: 'sales',
      label: t('analytics.tabs.sales'),
      icon: <ShoppingCart className="w-4 h-4 mr-2" />
    },
    {
      id: 'games',
      label: t('analytics.tabs.games'),
      icon: <GamepadIcon className="w-4 h-4 mr-2" />
    },
    {
      id: 'reports',
      label: t('analytics.tabs.reports'),
      icon: <FileText className="w-4 h-4 mr-2" />
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