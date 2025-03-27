import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { 
  Bell, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw
} from 'lucide-react';
import { NotificationForm } from '@/components/admin/notifications/notification-form';

interface NotificationsPageProps {
  searchParams?: {
    tab?: string;
  };
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  isRead: boolean;
}

async function getSystemNotifications() {
  // In a real implementation, this would fetch actual notifications from the database
  // For now, we'll return mock data
  
  const notifications: SystemNotification[] = [
    {
      id: '1',
      title: 'System Update Completed',
      message: 'The system has been successfully updated to version 2.5.0.',
      type: 'success',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false
    },
    {
      id: '2',
      title: 'New User Registrations',
      message: 'There have been 25 new user registrations in the last 24 hours.',
      type: 'info',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: false
    },
    {
      id: '3',
      title: 'Database Backup Warning',
      message: 'The automated database backup failed. Please check the server logs.',
      type: 'warning',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      isRead: true
    },
    {
      id: '4',
      title: 'API Rate Limit Exceeded',
      message: 'The external payment API rate limit has been exceeded. Some transactions may be delayed.',
      type: 'error',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      isRead: true
    },
    {
      id: '5',
      title: 'New Game Published',
      message: 'A new game "Epic Adventure" has been published and is awaiting approval.',
      type: 'info',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      isRead: true
    }
  ];
  
  return notifications;
}

async function getNotificationSettings() {
  // In a real implementation, this would fetch actual settings from the database
  // For now, we'll return mock data
  
  return {
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    notifyOnNewUser: true,
    notifyOnNewPurchase: true,
    notifyOnNewReview: false,
    notifyOnSystemEvents: true,
    digestFrequency: 'daily'
  };
}

async function getUserGroups() {
  // In a real implementation, this would fetch actual user groups from the database
  // For now, we'll return mock data
  
  return [
    { id: 'all', name: 'All Users', count: 1250 },
    { id: 'admins', name: 'Administrators', count: 5 },
    { id: 'publishers', name: 'Publishers', count: 28 },
    { id: 'developers', name: 'Developers', count: 42 },
    { id: 'premium', name: 'Premium Users', count: 156 },
    { id: 'new', name: 'New Users (Last 30 Days)', count: 87 }
  ];
}

// Helper function to format date
function formatDate(date: Date) {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
}

// Helper function to get icon for notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const t = await getTranslations('admin');
  
  // Determine which tab is active
  const activeTab = searchParams?.tab || 'notifications';
  
  // Fetch data
  const notifications = await getSystemNotifications();
  const settings = await getNotificationSettings();
  const userGroups = await getUserGroups();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('notifications.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/notifications?refresh=${Date.now()}`}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px" aria-label="Tabs">
            <Link
              href={`/admin/notifications?tab=notifications`}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              aria-current={activeTab === 'notifications' ? 'page' : undefined}
            >
              <Bell className="w-4 h-4 mr-2" />
              {t('notifications.tabs.notifications')}
            </Link>
            <Link
              href={`/admin/notifications?tab=send`}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'send'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              aria-current={activeTab === 'send' ? 'page' : undefined}
            >
              <Send className="w-4 h-4 mr-2" />
              {t('notifications.tabs.send')}
            </Link>
            <Link
              href={`/admin/notifications?tab=settings`}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('notifications.tabs.settings')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t('notifications.systemNotifications')}</h2>
            <button className="text-sm text-primary hover:underline">
              {t('notifications.markAllAsRead')}
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${notification.isRead ? '' : 'bg-primary/5'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('notifications.noNotifications')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('notifications.allClear')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'send' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('notifications.sendNotification')}</h2>
          <Suspense fallback={<div>Loading notification form...</div>}>
            <NotificationForm userGroups={userGroups} />
          </Suspense>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('notifications.notificationSettings')}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-3">{t('notifications.channels')}</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm">
                    {t('notifications.settings.email')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="pushNotifications" className="ml-2 block text-sm">
                    {t('notifications.settings.push')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inAppNotifications"
                    checked={settings.inAppNotifications}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="inAppNotifications" className="ml-2 block text-sm">
                    {t('notifications.settings.inApp')}
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">{t('notifications.events')}</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnNewUser"
                    checked={settings.notifyOnNewUser}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="notifyOnNewUser" className="ml-2 block text-sm">
                    {t('notifications.settings.newUser')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnNewPurchase"
                    checked={settings.notifyOnNewPurchase}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="notifyOnNewPurchase" className="ml-2 block text-sm">
                    {t('notifications.settings.newPurchase')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnNewReview"
                    checked={settings.notifyOnNewReview}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="notifyOnNewReview" className="ml-2 block text-sm">
                    {t('notifications.settings.newReview')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyOnSystemEvents"
                    checked={settings.notifyOnSystemEvents}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    readOnly
                  />
                  <label htmlFor="notifyOnSystemEvents" className="ml-2 block text-sm">
                    {t('notifications.settings.systemEvents')}
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">{t('notifications.digestSettings')}</h3>
              <div className="max-w-xs">
                <label htmlFor="digestFrequency" className="block text-sm font-medium mb-1">
                  {t('notifications.settings.digestFrequency')}
                </label>
                <select
                  id="digestFrequency"
                  value={settings.digestFrequency}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled
                >
                  <option value="realtime">{t('notifications.settings.realtime')}</option>
                  <option value="hourly">{t('notifications.settings.hourly')}</option>
                  <option value="daily">{t('notifications.settings.daily')}</option>
                  <option value="weekly">{t('notifications.settings.weekly')}</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {t('notifications.settings.saveSettings')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}