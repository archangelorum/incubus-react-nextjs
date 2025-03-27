'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, Filter } from 'lucide-react';

interface RoleCount {
  role: string;
  count: number;
}

interface UserSearchFormProps {
  currentQuery: string;
  currentRole: string;
  roleCounts: RoleCount[];
}

export function UserSearchForm({ currentQuery, currentRole, roleCounts }: UserSearchFormProps) {
  const [query, setQuery] = useState(currentQuery);
  const [role, setRole] = useState(currentRole);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('admin');

  // Update local state when props change (e.g., when navigating)
  useEffect(() => {
    setQuery(currentQuery);
    setRole(currentRole);
  }, [currentQuery, currentRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (role) params.set('role', role);
    
    // Navigate to the same page with new query parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setQuery('');
    setRole('');
    router.push(pathname);
  };

  const handleRoleFilter = (selectedRole: string) => {
    setRole(selectedRole === role ? '' : selectedRole);
    setIsFilterOpen(false);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (selectedRole && selectedRole !== role) params.set('role', selectedRole);
    
    // Navigate to the same page with new query parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full p-2.5 pl-10 text-sm border rounded-lg bg-gray-50 border-gray-300 text-gray-900 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder={t('users.search.placeholder')}
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
      </form>

      <div className="flex space-x-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              role
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {role ? t(`users.roles.${role.toLowerCase()}`, { fallback: role }) : t('users.search.filterByRole')}
          </button>

          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {roleCounts.map((roleCount) => (
                    <button
                      key={roleCount.role}
                      onClick={() => handleRoleFilter(roleCount.role)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        role === roleCount.role
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <span>{t(`users.roles.${roleCount.role.toLowerCase()}`, { fallback: roleCount.role })}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {roleCount.count}
                      </span>
                    </button>
                  ))}
                  
                  {roleCounts.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('users.search.noRolesFound')}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {(query || role) && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {t('users.search.clear')}
          </button>
        )}
      </div>
    </div>
  );
}