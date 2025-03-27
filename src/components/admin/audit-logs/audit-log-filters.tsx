'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, Calendar, X } from 'lucide-react';

interface AuditLogFiltersProps {
  actionTypes: { value: string; label: string; count: number }[];
  entityTypes: { value: string; label: string; count: number }[];
  users: { id: string; name: string }[];
  currentAction?: string;
  currentEntityType?: string;
  currentUserId?: string;
  currentDateRange?: { from?: string; to?: string };
  currentQuery?: string;
}

export function AuditLogFilters({
  actionTypes,
  entityTypes,
  users,
  currentAction = '',
  currentEntityType = '',
  currentUserId = '',
  currentDateRange = {},
  currentQuery = ''
}: AuditLogFiltersProps) {
  const [isActionFilterOpen, setIsActionFilterOpen] = useState(false);
  const [isEntityFilterOpen, setIsEntityFilterOpen] = useState(false);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [query, setQuery] = useState(currentQuery);
  const [dateRange, setDateRange] = useState({
    from: currentDateRange.from || '',
    to: currentDateRange.to || ''
  });
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('admin');

  // Update local state when props change
  useEffect(() => {
    setQuery(currentQuery);
    setDateRange({
      from: currentDateRange.from || '',
      to: currentDateRange.to || ''
    });
  }, [currentQuery, currentDateRange]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    router.push(`${pathname}?${createQueryString({ query })}`);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const params: Record<string, string> = {};
    
    switch (filterType) {
      case 'action':
        params.action = value === currentAction ? '' : value;
        setIsActionFilterOpen(false);
        break;
      case 'entityType':
        params.entityType = value === currentEntityType ? '' : value;
        setIsEntityFilterOpen(false);
        break;
      case 'userId':
        params.userId = value === currentUserId ? '' : value;
        setIsUserFilterOpen(false);
        break;
    }
    
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyDateRange = () => {
    const params: Record<string, string> = {};
    
    if (dateRange.from) {
      params.from = dateRange.from;
    }
    
    if (dateRange.to) {
      params.to = dateRange.to;
    }
    
    router.push(`${pathname}?${createQueryString(params)}`);
    setIsDateFilterOpen(false);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = currentAction || currentEntityType || currentUserId || currentDateRange.from || currentDateRange.to || currentQuery;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full p-2.5 pl-10 text-sm border rounded-lg bg-gray-50 border-gray-300 text-gray-900 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder={t('auditLogs.search.placeholder')}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="ml-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          {t('auditLogs.search.search')}
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Action Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsActionFilterOpen(!isActionFilterOpen)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              currentAction
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {currentAction 
              ? t(`auditLogs.actions.${currentAction.toLowerCase()}`, { fallback: currentAction })
              : t('auditLogs.filters.action')}
          </button>

          {isActionFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsActionFilterOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                  {actionTypes.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleFilterChange('action', action.value)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        currentAction === action.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <span>{action.label}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {action.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Entity Type Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEntityFilterOpen(!isEntityFilterOpen)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              currentEntityType
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {currentEntityType 
              ? t(`auditLogs.entityTypes.${currentEntityType.toLowerCase()}`, { fallback: currentEntityType })
              : t('auditLogs.filters.entityType')}
          </button>

          {isEntityFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsEntityFilterOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                  {entityTypes.map((entity) => (
                    <button
                      key={entity.value}
                      onClick={() => handleFilterChange('entityType', entity.value)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        currentEntityType === entity.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <span>{entity.label}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {entity.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              currentUserId
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {currentUserId 
              ? users.find(u => u.id === currentUserId)?.name || t('auditLogs.filters.user')
              : t('auditLogs.filters.user')}
          </button>

          {isUserFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsUserFilterOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleFilterChange('userId', user.id)}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        currentUserId === user.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              currentDateRange.from || currentDateRange.to
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {currentDateRange.from || currentDateRange.to
              ? `${currentDateRange.from || ''} - ${currentDateRange.to || ''}`
              : t('auditLogs.filters.dateRange')}
          </button>

          {isDateFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDateFilterOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="p-4" role="menu" aria-orientation="vertical">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('auditLogs.filters.from')}
                      </label>
                      <input
                        type="date"
                        id="from"
                        name="from"
                        value={dateRange.from}
                        onChange={handleDateRangeChange}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('auditLogs.filters.to')}
                      </label>
                      <input
                        type="date"
                        id="to"
                        name="to"
                        value={dateRange.to}
                        onChange={handleDateRangeChange}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      />
                    </div>
                    <button
                      onClick={handleApplyDateRange}
                      className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      {t('auditLogs.filters.apply')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            {t('auditLogs.filters.clear')}
          </button>
        )}
      </div>
    </div>
  );
}