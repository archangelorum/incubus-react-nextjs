'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Clock
} from 'lucide-react';

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

interface ErrorLogListProps {
  logs: ErrorLog[];
}

export function ErrorLogList({ logs }: ErrorLogListProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const t = useTranslations('admin');

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Toggle expanded state for a log
  const toggleExpanded = (id: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get icon for log level
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {logs.length > 0 ? (
        logs.map((log) => (
          <div 
            key={log.id} 
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden"
          >
            <div 
              className="p-4 flex items-start justify-between cursor-pointer"
              onClick={() => toggleExpanded(log.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  {getLevelIcon(log.level)}
                </div>
                <div>
                  <div className="font-medium">{log.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-medium">{t('monitoring.errors.source')}:</span> {log.source}
                    <span className="mx-2">•</span>
                    <span className="font-medium">{t('monitoring.errors.occurrences')}:</span> {log.count}
                    <span className="mx-2">•</span>
                    <span className="font-medium">{t('monitoring.errors.lastSeen')}:</span> {formatRelativeTime(log.lastOccurrence)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  log.level === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  log.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {t(`monitoring.errors.levels.${log.level}`)}
                </div>
                {expandedLogs[log.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedLogs[log.id] && log.stackTrace && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('monitoring.errors.stackTrace')}
                </div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                  {log.stackTrace}
                </pre>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {t('monitoring.errors.firstSeen')}: {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t('monitoring.errors.noErrors')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('monitoring.errors.allClear')}
          </p>
        </div>
      )}
    </div>
  );
}