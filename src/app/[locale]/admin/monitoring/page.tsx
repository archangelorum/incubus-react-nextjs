import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { 
  Activity, 
  Server, 
  Database, 
  Globe} from 'lucide-react';
import { SystemRefreshButton } from '@/components/admin/monitoring/system-refresh-button';
import { ErrorLogList } from '@/components/admin/monitoring/error-log-list';
import { MetricsChart } from '@/components/admin/monitoring/metrics-chart';

interface SystemMetrics {
  server: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    lastRestart: string;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connectionPool: number;
    activeQueries: number;
    slowQueries: number;
    avgQueryTime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'critical';
    requestsPerMinute: number;
    avgResponseTime: number;
    errorRate: number;
    endpoints: {
      path: string;
      requests: number;
      avgResponseTime: number;
      errorRate: number;
    }[];
  };
  blockchain: {
    status: 'healthy' | 'warning' | 'critical';
    lastSyncTime: string;
    syncStatus: 'synced' | 'syncing' | 'failed';
    blockHeight: number;
    connections: number;
  };
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  stackTrace?: string;
  count: number;
  lastOccurrence: string;
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  // In a real implementation, this would fetch actual metrics from monitoring services
  // For now, we'll return mock data
  
  return {
    server: {
      status: 'healthy',
      uptime: '15d 7h 23m',
      cpuUsage: 32,
      memoryUsage: 45,
      diskUsage: 38,
      lastRestart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    database: {
      status: 'healthy',
      connectionPool: 12,
      activeQueries: 3,
      slowQueries: 0,
      avgQueryTime: 45 // ms
    },
    api: {
      status: 'healthy',
      requestsPerMinute: 124,
      avgResponseTime: 87, // ms
      errorRate: 0.2, // percentage
      endpoints: [
        { path: '/api/games', requests: 45, avgResponseTime: 65, errorRate: 0 },
        { path: '/api/users', requests: 23, avgResponseTime: 78, errorRate: 0 },
        { path: '/api/marketplace', requests: 32, avgResponseTime: 92, errorRate: 0.5 },
        { path: '/api/wallets', requests: 18, avgResponseTime: 120, errorRate: 0.8 }
      ]
    },
    blockchain: {
      status: 'healthy',
      lastSyncTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      syncStatus: 'synced',
      blockHeight: 12345678,
      connections: 8
    }
  };
}

async function getErrorLogs(): Promise<ErrorLog[]> {
  // In a real implementation, this would fetch actual error logs from a logging service
  // For now, we'll return mock data
  
  return [
    {
      id: '1',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      level: 'error',
      message: 'Failed to process transaction: Insufficient funds',
      source: '/api/wallets/[id]/transactions',
      stackTrace: 'Error: Insufficient funds\n  at processTransaction (/src/app/api/wallets/[id]/transactions/route.ts:156:23)\n  at handler (/src/app/api/wallets/[id]/transactions/route.ts:42:12)',
      count: 3,
      lastOccurrence: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      level: 'warning',
      message: 'Slow database query detected (took 2.5s)',
      source: '/api/games',
      stackTrace: 'Query: SELECT * FROM game WHERE ...',
      count: 5,
      lastOccurrence: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      level: 'error',
      message: 'Failed to connect to blockchain node',
      source: 'BlockchainService',
      stackTrace: 'Error: Connection refused\n  at BlockchainService.connect (/src/services/blockchain.ts:78:12)',
      count: 1,
      lastOccurrence: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      level: 'warning',
      message: 'Rate limit exceeded for user',
      source: '/api/middleware',
      count: 12,
      lastOccurrence: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'System maintenance scheduled for tomorrow at 02:00 UTC',
      source: 'SystemAdmin',
      count: 1,
      lastOccurrence: new Date(Date.now() - 240 * 60 * 1000).toISOString()
    }
  ];
}

async function getHistoricalMetrics() {
  // In a real implementation, this would fetch historical metrics for charts
  // For now, we'll return mock data
  
  // Generate 24 hours of data points (one per hour)
  const hours = 24;
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  const cpuData = Array.from({ length: hours }, (_, i) => {
    const time = new Date(now - (hours - i - 1) * hourMs).toISOString();
    // Generate a value between 20-60 with some randomness
    const value = 20 + Math.floor(Math.random() * 40);
    return { time, value };
  });
  
  const memoryData = Array.from({ length: hours }, (_, i) => {
    const time = new Date(now - (hours - i - 1) * hourMs).toISOString();
    // Generate a value between 30-70 with some randomness
    const value = 30 + Math.floor(Math.random() * 40);
    return { time, value };
  });
  
  const requestsData = Array.from({ length: hours }, (_, i) => {
    const time = new Date(now - (hours - i - 1) * hourMs).toISOString();
    // Generate a value between 50-200 with some randomness
    const value = 50 + Math.floor(Math.random() * 150);
    return { time, value };
  });
  
  const responseTimeData = Array.from({ length: hours }, (_, i) => {
    const time = new Date(now - (hours - i - 1) * hourMs).toISOString();
    // Generate a value between 50-150 with some randomness
    const value = 50 + Math.floor(Math.random() * 100);
    return { time, value };
  });
  
  return {
    cpu: cpuData,
    memory: memoryData,
    requests: requestsData,
    responseTime: responseTimeData
  };
}

export default async function MonitoringPage() {
  const t = await getTranslations('admin');
  
  // Fetch data
  const metrics = await getSystemMetrics();
  const errorLogs = await getErrorLogs();
  const historicalMetrics = await getHistoricalMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('monitoring.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('monitoring.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('monitoring.lastUpdated')}: {new Date().toLocaleTimeString()}
          </span>
          <SystemRefreshButton />
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.server.title')}</p>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  metrics.server.status === 'healthy' ? 'bg-green-500' :
                  metrics.server.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-bold">{t(`monitoring.status.${metrics.server.status}`)}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('monitoring.server.uptime')}: {metrics.server.uptime}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Server className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.database.title')}</p>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  metrics.database.status === 'healthy' ? 'bg-green-500' :
                  metrics.database.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-bold">{t(`monitoring.status.${metrics.database.status}`)}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('monitoring.database.queries')}: {metrics.database.activeQueries} active</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Database className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.api.title')}</p>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  metrics.api.status === 'healthy' ? 'bg-green-500' :
                  metrics.api.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-bold">{t(`monitoring.status.${metrics.api.status}`)}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{metrics.api.requestsPerMinute} {t('monitoring.api.requestsPerMinute')}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Globe className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.blockchain.title')}</p>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  metrics.blockchain.status === 'healthy' ? 'bg-green-500' :
                  metrics.blockchain.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-bold">{t(`monitoring.status.${metrics.blockchain.status}`)}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t(`monitoring.blockchain.syncStatus.${metrics.blockchain.syncStatus}`)}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Activity className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">{t('monitoring.resources.title')}</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('monitoring.resources.cpu')}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.server.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      metrics.server.cpuUsage > 80 ? 'bg-red-500' :
                      metrics.server.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.server.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('monitoring.resources.memory')}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.server.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      metrics.server.memoryUsage > 80 ? 'bg-red-500' :
                      metrics.server.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${metrics.server.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('monitoring.resources.disk')}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.server.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      metrics.server.diskUsage > 80 ? 'bg-red-500' :
                      metrics.server.diskUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${metrics.server.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Suspense fallback={<div>Loading chart...</div>}>
                <MetricsChart 
                  title={t('monitoring.charts.resourceUsage')}
                  data={[
                    { id: 'cpu', data: historicalMetrics.cpu, color: 'green' },
                    { id: 'memory', data: historicalMetrics.memory, color: 'blue' }
                  ]}
                  yAxisLabel="%"
                />
              </Suspense>
            </div>
          </div>
        </div>
        
        {/* API Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">{t('monitoring.api.performance')}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.api.avgResponseTime')}</span>
                  <span className="text-lg font-semibold">{metrics.api.avgResponseTime} ms</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('monitoring.api.errorRate')}</span>
                  <span className={`text-lg font-semibold ${
                    metrics.api.errorRate > 5 ? 'text-red-500' :
                    metrics.api.errorRate > 1 ? 'text-yellow-500' : 'text-green-500'
                  }`}>{metrics.api.errorRate}%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Suspense fallback={<div>Loading chart...</div>}>
                <MetricsChart 
                  title={t('monitoring.charts.apiPerformance')}
                  data={[
                    { id: 'requests', data: historicalMetrics.requests, color: 'purple' },
                    { id: 'responseTime', data: historicalMetrics.responseTime, color: 'orange' }
                  ]}
                  yAxisLabel=""
                />
              </Suspense>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">{t('monitoring.api.topEndpoints')}</h3>
              <div className="space-y-3">
                {metrics.api.endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{endpoint.path}</div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{endpoint.requests} {t('monitoring.api.requests')}</span>
                        <span className="mx-2">•</span>
                        <span>{endpoint.avgResponseTime} ms</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.errorRate > 5 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      endpoint.errorRate > 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {endpoint.errorRate}% {t('monitoring.api.errors')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('monitoring.errors.title')}</h2>
          <Link 
            href="/admin/monitoring/logs" 
            className="text-sm text-primary hover:underline"
          >
            {t('monitoring.errors.viewAll')}
          </Link>
        </div>
        <div className="p-4">
          <Suspense fallback={<div>Loading error logs...</div>}>
            <ErrorLogList logs={errorLogs} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}