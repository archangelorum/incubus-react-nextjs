import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight,
  Download,
  User,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  Eye,
  CreditCard
} from 'lucide-react';
import { AuditLogFilters } from '@/components/admin/audit-logs/audit-log-filters';

// Default page size
const PAGE_SIZE = 20;

interface AuditLogsPageProps {
  searchParams?: {
    page?: string;
    action?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
    query?: string;
  };
}

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

interface ActionType {
  action: string;
  count: string | number;
}

interface EntityType {
  entityType: string;
  count: string | number;
}

async function getAuditLogs(searchParams: AuditLogsPageProps['searchParams'] = {}) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;
  
  // Build where clause
  const where: any = {};
  
  if (searchParams.action) {
    where.action = searchParams.action;
  }
  
  if (searchParams.entityType) {
    where.entityType = searchParams.entityType;
  }
  
  if (searchParams.userId) {
    where.userId = searchParams.userId;
  }
  
  if (searchParams.from || searchParams.to) {
    where.timestamp = {};
    
    if (searchParams.from) {
      where.timestamp.gte = new Date(searchParams.from);
    }
    
    if (searchParams.to) {
      where.timestamp.lte = new Date(searchParams.to);
    }
  }
  
  if (searchParams.query) {
    where.OR = [
      { action: { contains: searchParams.query, mode: 'insensitive' } },
      { entityType: { contains: searchParams.query, mode: 'insensitive' } },
      { entityId: { contains: searchParams.query, mode: 'insensitive' } }
    ];
  }
  
  // Get audit logs with pagination
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc'
    },
    skip,
    take: PAGE_SIZE,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
  
  // Get total count for pagination
  const totalLogs = await prisma.auditLog.count({ where });
  const totalPages = Math.ceil(totalLogs / PAGE_SIZE);
  
  // Get action types for filters
  const actionTypesResult = await prisma.$queryRaw`
    SELECT "action", COUNT(*) as "count" 
    FROM "audit_log" 
    GROUP BY "action"
    ORDER BY "count" DESC
  `;
  
  // Get entity types for filters
  const entityTypesResult = await prisma.$queryRaw`
    SELECT "entityType", COUNT(*) as "count" 
    FROM "audit_log" 
    GROUP BY "entityType"
    ORDER BY "count" DESC
  `;
  
  // Get users for filters
  const users = await prisma.user.findMany({
    where: {
      auditLogs: {
        some: {}
      }
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          auditLogs: true
        }
      }
    },
    orderBy: {
      auditLogs: {
        _count: 'desc'
      }
    },
    take: 20 // Limit to top 20 users
  });
  
  // Type assertions for raw query results
  const actionTypes = actionTypesResult as ActionType[];
  const entityTypes = entityTypesResult as EntityType[];
  
  return {
    logs,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalLogs,
      totalPages
    },
    filters: {
      actionTypes: actionTypes.map((action) => ({
        value: action.action,
        label: action.action,
        count: Number(action.count)
      })),
      entityTypes: entityTypes.map((entity) => ({
        value: entity.entityType,
        label: entity.entityType,
        count: Number(entity.count)
      })),
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        count: user._count.auditLogs
      }))
    }
  };
}

// Helper function to format date
function formatDate(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Helper function to get icon for entity type
function getEntityIcon(entityType: string) {
  switch (entityType.toLowerCase()) {
    case 'user':
      return <User className="w-5 h-5 text-blue-500" />;
    case 'game':
    case 'gamelicense':
    case 'gameversion':
    case 'gameitem':
      return <FileText className="w-5 h-5 text-green-500" />;
    case 'transaction':
    case 'wallet':
      return <CreditCard className="w-5 h-5 text-yellow-500" />;
    case 'organization':
    case 'publisher':
    case 'developer':
      return <Users className="w-5 h-5 text-purple-500" />;
    case 'review':
    case 'dispute':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'setting':
      return <Settings className="w-5 h-5 text-gray-500" />;
    default:
      return <ClipboardList className="w-5 h-5 text-gray-500" />;
  }
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const t = await getTranslations('admin');

  searchParams = await searchParams;
  
  // Fetch audit logs
  const { logs, pagination, filters } = await getAuditLogs(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('auditLogs.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auditLogs.subtitle')}
          </p>
        </div>
        <button
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          {t('auditLogs.exportLogs')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <Suspense fallback={<div>Loading filters...</div>}>
          <AuditLogFilters 
            actionTypes={filters.actionTypes}
            entityTypes={filters.entityTypes}
            users={filters.users}
            currentAction={searchParams?.action}
            currentEntityType={searchParams?.entityType}
            currentUserId={searchParams?.userId}
            currentDateRange={{
              from: searchParams?.from,
              to: searchParams?.to
            }}
            currentQuery={searchParams?.query}
          />
        </Suspense>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">{t('auditLogs.table.timestamp')}</th>
                <th className="px-6 py-3">{t('auditLogs.table.user')}</th>
                <th className="px-6 py-3">{t('auditLogs.table.action')}</th>
                <th className="px-6 py-3">{t('auditLogs.table.entity')}</th>
                <th className="px-6 py-3">{t('auditLogs.table.details')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    {log.user ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-2">
                          {log.user.image ? (
                            <img
                              src={log.user.image}
                              alt={log.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{log.user.email}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('auditLogs.table.system')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">
                      {t(`actions.${log.action.toLowerCase()}`, { fallback: log.action })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getEntityIcon(log.entityType)}
                      <div className="ml-2">
                        <div className="font-medium">
                          {t(`entityTypes.${log.entityType.toLowerCase()}`, { fallback: log.entityType })}
                        </div>
                        {log.entityId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {log.entityId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.details ? (
                      <button
                        className="flex items-center text-primary hover:underline"
                        title={JSON.stringify(log.details, null, 2)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('auditLogs.table.viewDetails')}
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('auditLogs.table.noDetails')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                      <h3 className="text-lg font-medium">{t('auditLogs.noLogsFound')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('auditLogs.tryDifferentFilters')}
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
              {t('auditLogs.pagination.showing', { 
                from: (pagination.page - 1) * pagination.pageSize + 1,
                to: Math.min(pagination.page * pagination.pageSize, pagination.totalLogs),
                total: pagination.totalLogs
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={{
                  pathname: "/admin/audit-logs",
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
                {t('auditLogs.pagination.page', { 
                  current: pagination.page, 
                  total: pagination.totalPages 
                })}
              </div>
              
              <Link
                href={{
                  pathname: "/admin/audit-logs",
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