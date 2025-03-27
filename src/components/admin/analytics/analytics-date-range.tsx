'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Calendar, ChevronDown } from 'lucide-react';

interface AnalyticsDateRangeProps {
  activePeriod: string;
  startDate?: string;
  endDate?: string;
  activeTab: string;
}

export function AnalyticsDateRange({ activePeriod, startDate, endDate, activeTab }: AnalyticsDateRangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: startDate || '',
    end: endDate || ''
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('admin');

  // Update local state when props change
  useEffect(() => {
    setCustomRange({
      start: startDate || '',
      end: endDate || ''
    });
  }, [startDate, endDate]);

  // Create a new URLSearchParams object to preserve other query parameters
  const createQueryString = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Update params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    return newParams.toString();
  };

  const handlePeriodChange = (period: string) => {
    const params: Record<string, string> = {
      tab: activeTab,
      period
    };
    
    // If custom period, include start and end dates
    if (period === 'custom') {
      params.start = customRange.start;
      params.end = customRange.end;
    } else {
      // Remove start and end dates for predefined periods
      params.start = '';
      params.end = '';
    }
    
    router.push(`${pathname}?${createQueryString(params)}`);
    setIsOpen(false);
  };

  const handleCustomRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyCustomRange = () => {
    if (customRange.start && customRange.end) {
      const params = {
        tab: activeTab,
        period: 'custom',
        start: customRange.start,
        end: customRange.end
      };
      
      router.push(`${pathname}?${createQueryString(params)}`);
      setIsOpen(false);
    }
  };

  const getPeriodLabel = () => {
    switch (activePeriod) {
      case 'today':
        return t('analytics.dateRange.today');
      case 'week':
        return t('analytics.dateRange.last7Days');
      case 'month':
        return t('analytics.dateRange.last30Days');
      case 'year':
        return t('analytics.dateRange.last12Months');
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate).toLocaleDateString();
          const end = new Date(endDate).toLocaleDateString();
          return `${start} - ${end}`;
        }
        return t('analytics.dateRange.custom');
      default:
        return t('analytics.dateRange.last7Days');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <Calendar className="w-4 h-4 mr-2" />
          <span>{getPeriodLabel()}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => handlePeriodChange('today')}
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    activePeriod === 'today'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {t('analytics.dateRange.today')}
                </button>
                
                <button
                  onClick={() => handlePeriodChange('week')}
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    activePeriod === 'week'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {t('analytics.dateRange.last7Days')}
                </button>
                
                <button
                  onClick={() => handlePeriodChange('month')}
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    activePeriod === 'month'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {t('analytics.dateRange.last30Days')}
                </button>
                
                <button
                  onClick={() => handlePeriodChange('year')}
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    activePeriod === 'year'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {t('analytics.dateRange.last12Months')}
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <div className="px-4 py-2">
                  <div className="text-sm font-medium mb-2">{t('analytics.dateRange.custom')}</div>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="start" className="block text-xs text-gray-500 dark:text-gray-400">
                        {t('analytics.dateRange.startDate')}
                      </label>
                      <input
                        type="date"
                        id="start"
                        name="start"
                        value={customRange.start}
                        onChange={handleCustomRangeChange}
                        className="w-full p-1 text-sm border rounded-md bg-background mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="end" className="block text-xs text-gray-500 dark:text-gray-400">
                        {t('analytics.dateRange.endDate')}
                      </label>
                      <input
                        type="date"
                        id="end"
                        name="end"
                        value={customRange.end}
                        onChange={handleCustomRangeChange}
                        className="w-full p-1 text-sm border rounded-md bg-background mt-1"
                      />
                    </div>
                    <button
                      onClick={handleApplyCustomRange}
                      className="w-full px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mt-2"
                      disabled={!customRange.start || !customRange.end}
                    >
                      {t('analytics.dateRange.apply')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
        {t('analytics.dateRange.dataUpdated')}: {new Date().toLocaleString()}
      </div>
    </div>
  );
}