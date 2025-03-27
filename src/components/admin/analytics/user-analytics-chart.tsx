'use client';

import { useTranslations } from 'next-intl';
import { BaseAnalyticsChart } from './base-analytics-chart';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface UserAnalyticsChartProps {
  data: ChartData;
}

export function UserAnalyticsChart({ data }: UserAnalyticsChartProps) {
  const t = useTranslations('admin');

  // Map the data to include colors
  const enhancedData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      color: index === 0 ? '#3b82f6' : '#10b981' // Blue for new users, green for active users
    }))
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.users.newUsers')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.users.activeUsers')}</span>
        </div>
      </div>
      
      <BaseAnalyticsChart 
        data={enhancedData} 
        height={300} 
        yAxisLabel={t('analytics.users.count')}
        type="line"
      />
    </div>
  );
}