'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  User, 
  FileText, 
  Wallet, 
  Settings, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

interface ActivityLogListProps {
  logs: ActivityLog[];
}

export function ActivityLogList({ logs }: ActivityLogListProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const t = useTranslations('admin');

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: Date) => {
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

  // Get icon for entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'game':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format action text
  const formatAction = (action: string, entityType: string, entityName?: string) => {
    const actionKey = `actions.${action.toLowerCase()}`;
    const entityTypeKey = `entityTypes.${entityType.toLowerCase()}`;
    
    const actionText = t(actionKey, { fallback: action });
    const entityTypeText = t(entityTypeKey, { fallback: entityType });
    
    if (entityName) {
      return t('activityLog.actionWithName', {
        action: actionText,
        entityType: entityTypeText,
        entityName
      });
    }
    
    return t('activityLog.action', {
      action: actionText,
      entityType: entityTypeText
    });
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
                  {log.user ? (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
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
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {log.user ? (
                      <Link href={`/admin/users?id=${log.user.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                        {log.user.name}
                      </Link>
                    ) : (
                      t('activityLog.system')
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {formatAction(log.action, log.entityType, log.entityName)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatRelativeTime(log.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8">
                  {expandedLogs[log.id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            
            {expandedLogs[log.id] && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-600">
                <div className="ml-11">
                  <div className="flex items-center mt-2 space-x-2">
                    {getEntityIcon(log.entityType)}
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t(`entityTypes.${log.entityType.toLowerCase()}`, { fallback: log.entityType })}
                      </span>
                      {log.entityId && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          (ID: {log.entityId})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('activityLog.timestamp')}: {new Date(log.timestamp).toLocaleString()}
                  </div>
                  
                  {log.entityType === 'game' && log.entityId && (
                    <div className="mt-2">
                      <Link 
                        href={`/admin/moderation?gameId=${log.entityId}`}
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('activityLog.viewDetails')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t('activityLog.noActivity')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('activityLog.checkBackLater')}
          </p>
        </div>
      )}
    </div>
  );
}