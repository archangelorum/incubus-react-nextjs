import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Link, redirect } from '@/i18n/navigation';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import { UserActionButtons } from '@/components/admin/users/user-action-buttons';
import { UserSearchForm } from '@/components/admin/users/user-search-form';

// Default page size
const PAGE_SIZE = 10;

interface UserListProps {
  searchParams?: {
    page?: string;
    query?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

async function getUsers(searchParams: UserListProps['searchParams'] = {}) {
  searchParams = await searchParams;
  
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;
  const query = searchParams.query || '';
  const role = searchParams.role || '';
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  // Build where clause
  const where: any = {};
  
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ];
  }
  
  if (role) {
    where.role = role;
  }

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get users with pagination
  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      banned: true,
      banReason: true,
      banExpires: true,
      _count: {
        select: {
          sessions: true,
          gameReviews: true,
          wallets: true
        }
      }
    }
  });

  // Get total count for pagination
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return {
    users,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalUsers,
      totalPages
    }
  };
}

export default async function UsersPage({ searchParams }: UserListProps) {
  const locale = await getLocale();
  const t = await getTranslations('admin');

  searchParams = await searchParams;

  // Check if user is authenticated and has admin role
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect({href: "/", locale});
  }
  
  const { users, pagination } = await getUsers(searchParams);
  
  // Get role counts for filter
  const roleCounts = await prisma.$queryRaw`
    SELECT "role", COUNT(*) as "count" 
    FROM "user" 
    WHERE "role" IS NOT NULL 
    GROUP BY "role"
  `;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('users.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('users.subtitle', { count: pagination.totalUsers })}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('users.actions.createUser')}
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Suspense fallback={<div>Loading search form...</div>}>
          <UserSearchForm 
            currentQuery={searchParams?.query || ''} 
            currentRole={searchParams?.role || ''}
            roleCounts={roleCounts as any}
          />
        </Suspense>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {t('users.table.user')}
                    <Link 
                      href={{
                        pathname: "/admin/users",
                        query: {
                          ...searchParams,
                          sortBy: 'name',
                          sortOrder: searchParams?.sortOrder === 'asc' && searchParams?.sortBy === 'name' ? 'desc' : 'asc'
                        }
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Link>
                  </div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {t('users.table.email')}
                    <Link 
                      href={{
                        pathname: "/admin/users",
                        query: {
                          ...searchParams,
                          sortBy: 'email',
                          sortOrder: searchParams?.sortOrder === 'asc' && searchParams?.sortBy === 'email' ? 'desc' : 'asc'
                        }
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Link>
                  </div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {t('users.table.role')}
                    <Link 
                      href={{
                        pathname: "/admin/users",
                        query: {
                          ...searchParams,
                          sortBy: 'role',
                          sortOrder: searchParams?.sortOrder === 'asc' && searchParams?.sortBy === 'role' ? 'desc' : 'asc'
                        }
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Link>
                  </div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {t('users.table.status')}
                  </div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {t('users.table.joined')}
                    <Link 
                      href={{
                        pathname: "/admin/users",
                        query: {
                          ...searchParams,
                          sortBy: 'createdAt',
                          sortOrder: searchParams?.sortOrder === 'asc' && searchParams?.sortBy === 'createdAt' ? 'desc' : 'asc'
                        }
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Link>
                  </div>
                </th>
                <th className="px-6 py-3 text-right">{t('users.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('users.table.activity', { 
                            sessions: user._count.sessions,
                            reviews: user._count.gameReviews
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.email}
                      {user.emailVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <Shield className="w-3 h-3 mr-1" />
                        {t('users.roles.admin')}
                      </span>
                    ) : user.role ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {t(`users.roles.${user.role.toLowerCase()}`, { fallback: user.role })}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t('users.roles.standard')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle className="w-3 h-3 mr-1" />
                        {t('users.status.banned')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('users.status.active')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionButtons userId={user.id} />
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                      <h3 className="text-lg font-medium">{t('users.noUsersFound')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('users.tryDifferentSearch')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('users.pagination.showing', { 
                from: (pagination.page - 1) * pagination.pageSize + 1,
                to: Math.min(pagination.page * pagination.pageSize, pagination.totalUsers),
                total: pagination.totalUsers
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={{
                  pathname: "/admin/users",
                  query: {
                    ...searchParams,
                    page: Math.max(1, pagination.page - 1)
                  }
                }}
                className={`p-2 rounded-md ${
                  pagination.page <= 1
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-disabled={pagination.page <= 1}
                tabIndex={pagination.page <= 1 ? -1 : undefined}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              
              <div className="text-sm font-medium">
                {t('users.pagination.page', { 
                  current: pagination.page, 
                  total: pagination.totalPages 
                })}
              </div>
              
              <Link
                href={{
                  pathname: "/admin/users",
                  query: {
                    ...searchParams,
                    page: Math.min(pagination.totalPages, pagination.page + 1)
                  }
                }}
                className={`p-2 rounded-md ${
                  pagination.page >= pagination.totalPages
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-disabled={pagination.page >= pagination.totalPages}
                tabIndex={pagination.page >= pagination.totalPages ? -1 : undefined}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}