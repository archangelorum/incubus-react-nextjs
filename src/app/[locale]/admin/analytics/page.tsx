import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { 
  Users, 
  ShoppingCart, 
  GamepadIcon, 
  Calendar, 
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AnalyticsTabs } from '@/components/admin/analytics/analytics-tabs';
import { AnalyticsDateRange } from '@/components/admin/analytics/analytics-date-range';
import { UserAnalyticsChart } from '@/components/admin/analytics/user-analytics-chart';
import { SalesAnalyticsChart } from '@/components/admin/analytics/sales-analytics-chart';
import { GameAnalyticsChart } from '@/components/admin/analytics/game-analytics-chart';
import { AnalyticsMetricsGrid } from '@/components/admin/analytics/analytics-metrics-grid';

interface AnalyticsPageProps {
  searchParams?: {
    tab?: string;
    period?: string;
    start?: string;
    end?: string;
  };
}

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    totalGames: number;
    totalDownloads: number;
    conversionRate: number;
  };
  userChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  salesChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  gameChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  topGames: {
    id: string;
    title: string;
    sales: number;
    revenue: number;
    downloads: number;
  }[];
  topCountries: {
    country: string;
    users: number;
    sales: number;
    revenue: number;
  }[];
}

async function getAnalyticsData(period: string, startDate?: string, endDate?: string): Promise<AnalyticsData> {
  // In a real implementation, this would fetch actual analytics data from the database
  // For now, we'll return mock data
  
  // Parse date range
  let start = new Date();
  let end = new Date();
  let labels: string[] = [];
  
  switch (period) {
    case 'today':
      // Set start to beginning of today
      start.setHours(0, 0, 0, 0);
      // Generate hourly labels
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      break;
    case 'week':
      // Set start to 7 days ago
      start.setDate(start.getDate() - 7);
      // Generate daily labels for the past week
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      break;
    case 'month':
      // Set start to 30 days ago
      start.setDate(start.getDate() - 30);
      // Generate weekly labels for the past month
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      break;
    case 'year':
      // Set start to 1 year ago
      start.setFullYear(start.getFullYear() - 1);
      // Generate monthly labels for the past year
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return date.toLocaleDateString('en-US', { month: 'short' });
      });
      break;
    case 'custom':
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        
        // Calculate the difference in days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          // Daily labels for short ranges
          labels = Array.from({ length: diffDays }, (_, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          });
        } else if (diffDays <= 31) {
          // Weekly labels for medium ranges
          const weeks = Math.ceil(diffDays / 7);
          labels = Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
        } else {
          // Monthly labels for long ranges
          const months = Math.ceil(diffDays / 30);
          labels = Array.from({ length: months }, (_, i) => {
            const date = new Date(start);
            date.setMonth(date.getMonth() + i);
            return date.toLocaleDateString('en-US', { month: 'short' });
          });
        }
      }
      break;
    default:
      // Default to last 7 days
      start.setDate(start.getDate() - 7);
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
  }
  
  // Generate random data for charts
  const generateRandomData = (min: number, max: number, length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  };
  
  // User chart data
  const newUsersData = generateRandomData(10, 100, labels.length);
  const activeUsersData = generateRandomData(50, 200, labels.length);
  
  // Sales chart data
  const revenueData = generateRandomData(500, 2000, labels.length);
  const salesData = generateRandomData(5, 30, labels.length);
  
  // Game chart data
  const downloadsData = generateRandomData(20, 150, labels.length);
  const playTimeData = generateRandomData(100, 500, labels.length);
  
  // Calculate totals
  const totalNewUsers = newUsersData.reduce((sum, val) => sum + val, 0);
  const totalActiveUsers = activeUsersData.reduce((sum, val) => sum + val, 0);
  const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
  const totalSales = salesData.reduce((sum, val) => sum + val, 0);
  const totalDownloads = downloadsData.reduce((sum, val) => sum + val, 0);
  
  return {
    metrics: {
      totalUsers: 1250 + totalNewUsers,
      newUsers: totalNewUsers,
      activeUsers: totalActiveUsers,
      totalRevenue: totalRevenue,
      totalSales: totalSales,
      averageOrderValue: totalRevenue / totalSales,
      totalGames: 78,
      totalDownloads: totalDownloads,
      conversionRate: (totalSales / totalDownloads) * 100
    },
    userChartData: {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: newUsersData
        },
        {
          label: 'Active Users',
          data: activeUsersData
        }
      ]
    },
    salesChartData: {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenueData
        },
        {
          label: 'Sales',
          data: salesData
        }
      ]
    },
    gameChartData: {
      labels,
      datasets: [
        {
          label: 'Downloads',
          data: downloadsData
        },
        {
          label: 'Play Time (hours)',
          data: playTimeData
        }
      ]
    },
    topGames: [
      { id: 'game1', title: 'Awesome Game 1', sales: 156, revenue: 4680, downloads: 320 },
      { id: 'game2', title: 'Epic Adventure', sales: 142, revenue: 4260, downloads: 285 },
      { id: 'game3', title: 'Space Explorer', sales: 98, revenue: 2940, downloads: 210 },
      { id: 'game4', title: 'Puzzle Master', sales: 87, revenue: 2610, downloads: 195 },
      { id: 'game5', title: 'Racing Legends', sales: 76, revenue: 2280, downloads: 180 }
    ],
    topCountries: [
      { country: 'United States', users: 450, sales: 210, revenue: 6300 },
      { country: 'Germany', users: 320, sales: 145, revenue: 4350 },
      { country: 'Japan', users: 280, sales: 120, revenue: 3600 },
      { country: 'United Kingdom', users: 210, sales: 95, revenue: 2850 },
      { country: 'Canada', users: 180, sales: 80, revenue: 2400 }
    ]
  };
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const t = await getTranslations('admin');
  
  // Determine which tab is active
  const activeTab = searchParams?.tab || 'overview';
  
  // Determine date range
  const period = searchParams?.period || 'week';
  const startDate = searchParams?.start;
  const endDate = searchParams?.end;
  
  // Fetch analytics data
  const analyticsData = await getAnalyticsData(period, startDate, endDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.exportData')}
          </button>
          <Link
            href={`/admin/analytics?tab=${activeTab}&period=${period}&refresh=${Date.now()}`}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <Suspense fallback={<div>Loading date range selector...</div>}>
          <AnalyticsDateRange 
            activePeriod={period} 
            startDate={startDate} 
            endDate={endDate} 
            activeTab={activeTab}
          />
        </Suspense>
      </div>

      {/* Tabs */}
      <Suspense fallback={<div>Loading tabs...</div>}>
        <AnalyticsTabs activeTab={activeTab} period={period} startDate={startDate} endDate={endDate} />
      </Suspense>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <Suspense fallback={<div>Loading metrics...</div>}>
            <AnalyticsMetricsGrid metrics={analyticsData.metrics} />
          </Suspense>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">{t('analytics.users.title')}</h2>
              <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
                <UserAnalyticsChart data={analyticsData.userChartData} />
              </Suspense>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">{t('analytics.sales.title')}</h2>
              <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
                <SalesAnalyticsChart data={analyticsData.salesChartData} />
              </Suspense>
            </div>
          </div>
          
          {/* Top Games */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">{t('analytics.topGames')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">{t('analytics.game')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.sales.short')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.revenue')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.downloads')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.conversionRate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topGames.map((game) => (
                    <tr key={game.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-medium">{game.title}</td>
                      <td className="px-6 py-4 text-right">{game.sales}</td>
                      <td className="px-6 py-4 text-right">${game.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{game.downloads}</td>
                      <td className="px-6 py-4 text-right">
                        {((game.sales / game.downloads) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Countries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">{t('analytics.topCountries')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">{t('analytics.country')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.users.short')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.sales.short')}</th>
                    <th className="px-6 py-3 text-right">{t('analytics.revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topCountries.map((country) => (
                    <tr key={country.country} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-medium">{country.country}</td>
                      <td className="px-6 py-4 text-right">{country.users}</td>
                      <td className="px-6 py-4 text-right">{country.sales}</td>
                      <td className="px-6 py-4 text-right">${country.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">{t('analytics.users.detailedTitle')}</h2>
            <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
              <UserAnalyticsChart data={analyticsData.userChartData} />
            </Suspense>
          </div>
          
          {/* Additional user analytics content would go here */}
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">{t('analytics.sales.detailedTitle')}</h2>
            <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
              <SalesAnalyticsChart data={analyticsData.salesChartData} />
            </Suspense>
          </div>
          
          {/* Additional sales analytics content would go here */}
        </div>
      )}

      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">{t('analytics.games.detailedTitle')}</h2>
            <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
              <GameAnalyticsChart data={analyticsData.gameChartData} />
            </Suspense>
          </div>
          
          {/* Additional game analytics content would go here */}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">{t('analytics.reports.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('analytics.reports.description')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium">{t('analytics.reports.userActivity')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('analytics.reports.userActivityDesc')}
              </p>
              <button className="text-sm text-primary hover:underline">
                {t('analytics.reports.generate')}
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-3">
                <ShoppingCart className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-medium">{t('analytics.reports.salesReport')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('analytics.reports.salesReportDesc')}
              </p>
              <button className="text-sm text-primary hover:underline">
                {t('analytics.reports.generate')}
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-3">
                <GamepadIcon className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="font-medium">{t('analytics.reports.gamePerformance')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('analytics.reports.gamePerformanceDesc')}
              </p>
              <button className="text-sm text-primary hover:underline">
                {t('analytics.reports.generate')}
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-medium">{t('analytics.reports.scheduledReports')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('analytics.reports.scheduledReportsDesc')}
              </p>
              <button className="text-sm text-primary hover:underline">
                {t('analytics.reports.manage')}
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-medium">{t('analytics.reports.customReport')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('analytics.reports.customReportDesc')}
              </p>
              <button className="text-sm text-primary hover:underline">
                {t('analytics.reports.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}