'use client';

import { useTranslations } from 'next-intl';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  GamepadIcon, 
  Download, 
  Percent 
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  totalGames: number;
  totalDownloads: number;
  conversionRate: number;
}

interface AnalyticsMetricsGridProps {
  metrics: Metrics;
}

export function AnalyticsMetricsGrid({ metrics }: AnalyticsMetricsGridProps) {
  const t = useTranslations('admin');

  const metricCards = [
    {
      title: t('analytics.metrics.totalUsers'),
      value: metrics.totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5 text-blue-500" />,
      change: '+12%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.newUsers'),
      value: metrics.newUsers.toLocaleString(),
      icon: <UserPlus className="w-5 h-5 text-green-500" />,
      change: '+8%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.activeUsers'),
      value: metrics.activeUsers.toLocaleString(),
      icon: <UserCheck className="w-5 h-5 text-purple-500" />,
      change: '+5%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.totalRevenue'),
      value: `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
      change: '+15%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.totalSales'),
      value: metrics.totalSales.toLocaleString(),
      icon: <ShoppingCart className="w-5 h-5 text-indigo-500" />,
      change: '+10%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.averageOrderValue'),
      value: `$${metrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <CreditCard className="w-5 h-5 text-pink-500" />,
      change: '+3%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.totalGames'),
      value: metrics.totalGames.toLocaleString(),
      icon: <GamepadIcon className="w-5 h-5 text-red-500" />,
      change: '+2%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.totalDownloads'),
      value: metrics.totalDownloads.toLocaleString(),
      icon: <Download className="w-5 h-5 text-cyan-500" />,
      change: '+18%',
      isPositive: true
    },
    {
      title: t('analytics.metrics.conversionRate'),
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: <Percent className="w-5 h-5 text-orange-500" />,
      change: '-0.5%',
      isPositive: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metricCards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              <p className={`text-xs flex items-center mt-1 ${
                card.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {card.isPositive ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {card.change} {t('analytics.metrics.fromPrevious')}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}