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

interface SalesAnalyticsChartProps {
  data: ChartData;
}

export function SalesAnalyticsChart({ data }: SalesAnalyticsChartProps) {
  const t = useTranslations('admin');

  // Map the data to include colors
  const enhancedData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      color: index === 0 ? '#f59e0b' : '#8b5cf6' // Yellow for revenue, purple for sales
    }))
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.sales.revenue')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.sales.orders')}</span>
        </div>
      </div>
      
      <BaseAnalyticsChart 
        data={enhancedData} 
        height={300} 
        yAxisLabel={t('analytics.sales.amount')}
        type="bar"
      />
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('analytics.sales.note')}
      </div>
    </div>
  );
}