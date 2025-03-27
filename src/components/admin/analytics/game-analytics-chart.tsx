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

interface GameAnalyticsChartProps {
  data: ChartData;
}

export function GameAnalyticsChart({ data }: GameAnalyticsChartProps) {
  const t = useTranslations('admin');

  // Map the data to include colors
  const enhancedData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      color: index === 0 ? '#ef4444' : '#06b6d4' // Red for downloads, cyan for play time
    }))
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.games.downloads')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
          <span className="text-sm">{t('analytics.games.playTime')}</span>
        </div>
      </div>
      
      <BaseAnalyticsChart 
        data={enhancedData} 
        height={300} 
        yAxisLabel={t('analytics.games.count')}
        type="line"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">{t('analytics.games.topGenres')}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Action</span>
              <span className="text-sm font-medium">32%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '32%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Adventure</span>
              <span className="text-sm font-medium">24%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">RPG</span>
              <span className="text-sm font-medium">18%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">{t('analytics.games.platformStats')}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Windows</span>
              <span className="text-sm font-medium">68%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">macOS</span>
              <span className="text-sm font-medium">22%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '22%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Linux</span>
              <span className="text-sm font-medium">10%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}