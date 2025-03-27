'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function SystemRefreshButton() {
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
      className={`p-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
      onClick={handleRefresh}
      aria-label={t('monitoring.actions.refresh')}
    >
      <RefreshCw className="w-4 h-4" />
    </button>
  );
}