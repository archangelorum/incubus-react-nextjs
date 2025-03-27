'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, Check } from 'lucide-react';

interface TypeCount {
  type: string;
  count: number;
}

interface ModerationFiltersProps {
  type: 'reviews' | 'reports';
  currentStatus: string;
  currentType?: string;
  typeCounts?: TypeCount[];
}

export function ModerationFilters({ 
  type, 
  currentStatus, 
  currentType = '',
  typeCounts = []
}: ModerationFiltersProps) {
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('admin');

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
    
    // Reset page when changing filters
    if (newParams.has('page')) {
      newParams.set('page', '1');
    }
    
    return newParams.toString();
  };

  const handleStatusFilter = (status: string) => {
    router.push(`${pathname}?${createQueryString({ 
      tab: type === 'reviews' ? 'reviews' : 'reports',
      status 
    })}`);
    setIsStatusFilterOpen(false);
  };

  const handleTypeFilter = (typeValue: string) => {
    router.push(`${pathname}?${createQueryString({ 
      tab: 'reports',
      type: typeValue === currentType ? '' : typeValue 
    })}`);
    setIsTypeFilterOpen(false);
  };

  // Get status options based on content type
  const getStatusOptions = () => {
    if (type === 'reviews') {
      return [
        { value: 'PENDING', label: t('moderation.filters.status.pending') },
        { value: 'APPROVED', label: t('moderation.filters.status.approved') },
        { value: 'REJECTED', label: t('moderation.filters.status.rejected') }
      ];
    } else {
      return [
        { value: 'OPEN', label: t('moderation.filters.status.open') },
        { value: 'UNDER_REVIEW', label: t('moderation.filters.status.underReview') },
        { value: 'RESOLVED', label: t('moderation.filters.status.resolved') },
        { value: 'CLOSED', label: t('moderation.filters.status.closed') }
      ];
    }
  };

  const statusOptions = getStatusOptions();

  return (
    <div className="flex flex-wrap gap-4">
      {/* Status Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            currentStatus
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('moderation.filters.statusLabel')}: {
            statusOptions.find(option => option.value === currentStatus)?.label || currentStatus
          }
        </button>

        {isStatusFilterOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsStatusFilterOpen(false)}
            />
            <div className="absolute left-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilter(option.value)}
                    className={`flex w-full items-center px-4 py-2 text-sm ${
                      currentStatus === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    role="menuitem"
                  >
                    {currentStatus === option.value && (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    <span className={currentStatus === option.value ? 'ml-6' : 'ml-0'}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Type Filter (only for reports) */}
      {type === 'reports' && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              currentType
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {currentType 
              ? t(`moderation.reports.types.${currentType.toLowerCase()}`, { fallback: currentType })
              : t('moderation.filters.typeLabel')}
          </button>

          {isTypeFilterOpen && typeCounts.length > 0 && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsTypeFilterOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {typeCounts.map((typeCount) => (
                    <button
                      key={typeCount.type}
                      onClick={() => handleTypeFilter(typeCount.type)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        currentType === typeCount.type
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        {currentType === typeCount.type && (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        <span className={currentType === typeCount.type ? 'ml-6' : 'ml-0'}>
                          {t(`moderation.reports.types.${typeCount.type.toLowerCase()}`, { fallback: typeCount.type })}
                        </span>
                      </div>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {typeCount.count}
                      </span>
                    </button>
                  ))}
                  
                  {/* Option to clear type filter */}
                  {currentType && (
                    <button
                      onClick={() => handleTypeFilter('')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      {t('moderation.filters.clearType')}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}