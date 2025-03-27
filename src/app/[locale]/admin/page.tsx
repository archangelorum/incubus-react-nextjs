import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { 
  Users, 
  ShoppingCart, 
  GamepadIcon, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { DashboardRefreshButton } from '@/components/admin/dashboard/dashboard-refresh-button';
import { ActivityLogList } from '@/components/admin/dashboard/activity-log-list';

interface DashboardMetrics {
  totalUsers: number;
  newUsers: {
    count: number;
    change: number;
  };
  totalGames: number;
  newGames: {
    count: number;
    change: number;
  };
  totalSales: number;
  revenue: {
    amount: number;
    change: number;
  };
  activeWallets: number;
  transactions: {
    count: number;
    change: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  user: {
    id: string;
    name: string;
    image?: string;
  } | null;
  entityType: string;
  entityId: string | null;
  entityName?: string;
  timestamp: Date;
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // In a real implementation, this would fetch actual metrics from the database
  // For now, we'll return mock data
  
  return {
    totalUsers: 1250,
    newUsers: {
      count: 87,
      change: 12.5
    },
    totalGames: 78,
    newGames: {
      count: 5,
      change: -10.2
    },
    totalSales: 3456,
    revenue: {
      amount: 45678.90,
      change: 8.7
    },
    activeWallets: 876,
    transactions: {
      count: 1234,
      change: 15.3
    }
  };
}

async function getRecentActivity(): Promise<ActivityLog[]> {
  // In a real implementation, this would fetch actual activity logs from the database
  // For now, we'll return mock data
  
  return [
    {
      id: '1',
      action: 'created',
      user: {
        id: 'user1',
        name: 'John Doe',
        image: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      entityType: 'game',
      entityId: 'game1',
      entityName: 'Epic Adventure',
      timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      id: '2',
      action: 'purchased',
      user: {
        id: 'user2',
        name: 'Jane Smith',
        image: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      entityType: 'game',
      entityId: 'game2',
      entityName: 'Space Explorer',
      timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
    },
    {
      id: '3',
      action: 'registered',
      user: {
        id: 'user3',
        name: 'Alex Johnson',
        image: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      entityType: 'user',
      entityId: 'user3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '4',
      action: 'updated',
      user: {
        id: 'user4',
        name: 'Emily Davis',
        image: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      entityType: 'game',
      entityId: 'game3',
      entityName: 'Puzzle Master',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      id: '5',
      action: 'reviewed',
      user: {
        id: 'user5',
        name: 'Michael Wilson',
        image: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      entityType: 'game',
      entityId: 'game4',
      entityName: 'Racing Legends',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
      id: '6',
      action: 'deposited',
      user: {
        id: 'user6',
        name: 'Sarah Brown',
        image: 'https://randomuser.me/api/portraits/women/6.jpg'
      },
      entityType: 'wallet',
      entityId: 'wallet1',
      entityName: '0.5 ETH',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      id: '7',
      action: 'system_update',
      user: null,
      entityType: 'system',
      entityId: null,
      entityName: 'System Maintenance',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    }
  ];
}

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin');
  
  // Fetch dashboard data
  const metrics = await getDashboardMetrics();
  const recentActivity = await getRecentActivity();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <DashboardRefreshButton />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.metrics.users')}</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.totalUsers.toLocaleString()}</h3>
              <div className={`text-xs flex items-center mt-1 ${
                metrics.newUsers.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {metrics.newUsers.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(metrics.newUsers.change)}% {t('dashboard.metrics.fromPrevious')}
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {metrics.newUsers.count} {t('dashboard.metrics.newThisWeek')}
          </div>
        </div>

        {/* Games Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.metrics.games')}</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.totalGames.toLocaleString()}</h3>
              <div className={`text-xs flex items-center mt-1 ${
                metrics.newGames.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {metrics.newGames.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(metrics.newGames.change)}% {t('dashboard.metrics.fromPrevious')}
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <GamepadIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {metrics.newGames.count} {t('dashboard.metrics.newThisWeek')}
          </div>
        </div>

        {/* Sales Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.metrics.revenue')}</p>
              <h3 className="text-2xl font-bold mt-1">${metrics.revenue.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <div className={`text-xs flex items-center mt-1 ${
                metrics.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {metrics.revenue.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(metrics.revenue.change)}% {t('dashboard.metrics.fromPrevious')}
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <ShoppingCart className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {metrics.totalSales.toLocaleString()} {t('dashboard.metrics.totalSales')}
          </div>
        </div>

        {/* Wallets Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.metrics.wallets')}</p>
              <h3 className="text-2xl font-bold mt-1">{metrics.activeWallets.toLocaleString()}</h3>
              <div className={`text-xs flex items-center mt-1 ${
                metrics.transactions.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {metrics.transactions.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(metrics.transactions.change)}% {t('dashboard.metrics.fromPrevious')}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Wallet className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {metrics.transactions.count.toLocaleString()} {t('dashboard.metrics.transactions')}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="font-medium">{t('dashboard.quickLinks.manageUsers')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.quickLinks.manageUsersDesc')}
          </p>
        </Link>
        
        <Link
          href="/admin/moderation"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="font-medium">{t('dashboard.quickLinks.moderateContent')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.quickLinks.moderateContentDesc')}
          </p>
        </Link>
        
        <Link
          href="/admin/analytics"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="font-medium">{t('dashboard.quickLinks.viewAnalytics')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.quickLinks.viewAnalyticsDesc')}
          </p>
        </Link>
        
        <Link
          href="/admin/settings"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="font-medium">{t('dashboard.quickLinks.configureSettings')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.quickLinks.configureSettingsDesc')}
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('dashboard.recentActivity')}</h2>
          <Link 
            href="/admin/audit-logs" 
            className="text-sm text-primary hover:underline"
          >
            {t('dashboard.viewAllActivity')}
          </Link>
        </div>
        <div className="p-4">
          <Suspense fallback={<div>Loading activity...</div>}>
            <ActivityLogList logs={recentActivity} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}