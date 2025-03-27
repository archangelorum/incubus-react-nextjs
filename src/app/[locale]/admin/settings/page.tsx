import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { 
  Settings, 
  Users, 
  Mail, 
  Globe, 
  Shield,
  Database,
  CreditCard,
  Bell
} from 'lucide-react';
import { SettingsTabs } from '@/components/admin/settings/settings-tabs';
import { SystemSettingsForm } from '@/components/admin/settings/system-settings-form';
import { NotificationSettingsForm } from '@/components/admin/settings/notification-settings-form';
import { IntegrationSettingsForm } from '@/components/admin/settings/integration-settings-form';

interface SettingsPageProps {
  searchParams?: {
    tab?: string;
  };
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  userRegistration: boolean;
  defaultUserRole: string;
  defaultLanguage: string;
  defaultTheme: 'light' | 'dark' | 'system';
  sessionTimeout: number;
  maxUploadSize: number;
}

interface NotificationSettings {
  adminEmail: string;
  emailNotifications: boolean;
  emailProvider: string;
  emailFromName: string;
  emailFromAddress: string;
  notifyOnNewUser: boolean;
  notifyOnNewPurchase: boolean;
  notifyOnNewReview: boolean;
  notifyOnError: boolean;
  discordWebhook: string;
  discordNotifications: boolean;
}

interface IntegrationSettings {
  googleAnalyticsId: string;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  polygonRpcUrl: string;
  ipfsGateway: string;
  ipfsApiKey: string;
}

async function getSystemSettings(): Promise<SystemSettings> {
  // In a real implementation, this would fetch actual settings from the database
  // For now, we'll return mock data
  
  return {
    siteName: 'Incubus',
    siteDescription: 'Polygon NFT Game Distribution Platform',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back later.',
    userRegistration: true,
    defaultUserRole: 'user',
    defaultLanguage: 'en',
    defaultTheme: 'system',
    sessionTimeout: 60, // minutes
    maxUploadSize: 100 // MB
  };
}

async function getNotificationSettings(): Promise<NotificationSettings> {
  // In a real implementation, this would fetch actual settings from the database
  // For now, we'll return mock data
  
  return {
    adminEmail: 'admin@example.com',
    emailNotifications: true,
    emailProvider: 'smtp',
    emailFromName: 'Incubus Platform',
    emailFromAddress: 'noreply@example.com',
    notifyOnNewUser: true,
    notifyOnNewPurchase: true,
    notifyOnNewReview: false,
    notifyOnError: true,
    discordWebhook: 'https://discord.com/api/webhooks/example',
    discordNotifications: false
  };
}

async function getIntegrationSettings(): Promise<IntegrationSettings> {
  // In a real implementation, this would fetch actual settings from the database
  // For now, we'll return mock data
  
  return {
    googleAnalyticsId: 'UA-XXXXXXXXX-X',
    recaptchaSiteKey: '6LxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX',
    recaptchaSecretKey: '6LxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX',
    stripePublicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
    stripeSecretKey: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
    polygonRpcUrl: 'https://polygon-rpc.com',
    ipfsGateway: 'https://ipfs.io/ipfs/',
    ipfsApiKey: 'xxxxxxxxxxxxxxxxxxxx'
  };
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const t = await getTranslations('admin');
  
  // Determine which tab is active
  const activeTab = searchParams?.tab || 'system';
  
  // Fetch settings based on active tab
  let systemSettings = null;
  let notificationSettings = null;
  let integrationSettings = null;
  
  if (activeTab === 'system') {
    systemSettings = await getSystemSettings();
  } else if (activeTab === 'notifications') {
    notificationSettings = await getNotificationSettings();
  } else if (activeTab === 'integrations') {
    integrationSettings = await getIntegrationSettings();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Settings Tabs */}
      <Suspense fallback={<div>Loading tabs...</div>}>
        <SettingsTabs activeTab={activeTab} />
      </Suspense>

      {/* Content based on active tab */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'system' && systemSettings && (
          <Suspense fallback={<div className="p-6">Loading system settings...</div>}>
            <SystemSettingsForm initialSettings={systemSettings} />
          </Suspense>
        )}
        
        {activeTab === 'notifications' && notificationSettings && (
          <Suspense fallback={<div className="p-6">Loading notification settings...</div>}>
            <NotificationSettingsForm initialSettings={notificationSettings} />
          </Suspense>
        )}
        
        {activeTab === 'integrations' && integrationSettings && (
          <Suspense fallback={<div className="p-6">Loading integration settings...</div>}>
            <IntegrationSettingsForm initialSettings={integrationSettings} />
          </Suspense>
        )}
        
        {activeTab === 'permissions' && (
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('settings.permissions.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  {t('settings.permissions.description')}
                </p>
                <div className="mt-6">
                  <a 
                    href="/admin/users" 
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t('settings.permissions.manageUsers')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('settings.quickSettings.backups')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('settings.quickSettings.lastBackup')}: 2 days ago
              </p>
            </div>
          </div>
          <button className="w-full mt-3 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
            {t('settings.quickSettings.createBackup')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('settings.quickSettings.payments')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('settings.quickSettings.paymentStatus')}: Active
              </p>
            </div>
          </div>
          <button className="w-full mt-3 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
            {t('settings.quickSettings.configurePayments')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('settings.quickSettings.domains')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('settings.quickSettings.primaryDomain')}: example.com
              </p>
            </div>
          </div>
          <button className="w-full mt-3 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
            {t('settings.quickSettings.manageDomains')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Bell className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('settings.quickSettings.notifications')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('settings.quickSettings.notificationCount')}: 4 channels
              </p>
            </div>
          </div>
          <button className="w-full mt-3 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
            {t('settings.quickSettings.configureNotifications')}
          </button>
        </div>
      </div>
    </div>
  );
}