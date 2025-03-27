'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function DashboardRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Refresh the current route
    router.refresh();
    // Reset the refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <button 
      className={`flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleRefresh}
      disabled={isRefreshing}
      aria-label={t('dashboard.actions.refresh')}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {t('dashboard.actions.refresh')}
    </button>
  );
}