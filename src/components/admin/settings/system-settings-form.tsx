'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Save, Loader2 } from 'lucide-react';

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

interface SystemSettingsFormProps {
  initialSettings: SystemSettings;
}

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, this would send the settings to the server
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the page to show updated settings
      router.refresh();
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('settings.system.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('settings.system.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('settings.system.siteInfo')}</h3>
          
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium mb-1">
              {t('settings.system.siteName')}
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          
          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium mb-1">
              {t('settings.system.siteDescription')}
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
        </div>
        
        {/* Maintenance Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('settings.system.maintenance')}</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm">
              {t('settings.system.enableMaintenance')}
            </label>
          </div>
          
          <div>
            <label htmlFor="maintenanceMessage" className="block text-sm font-medium mb-1">
              {t('settings.system.maintenanceMessage')}
            </label>
            <textarea
              id="maintenanceMessage"
              name="maintenanceMessage"
              value={settings.maintenanceMessage}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!settings.maintenanceMode}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* User Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('settings.system.userSettings')}</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="userRegistration"
              name="userRegistration"
              checked={settings.userRegistration}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="userRegistration" className="ml-2 block text-sm">
              {t('settings.system.allowRegistration')}
            </label>
          </div>
          
          <div>
            <label htmlFor="defaultUserRole" className="block text-sm font-medium mb-1">
              {t('settings.system.defaultRole')}
            </label>
            <select
              id="defaultUserRole"
              name="defaultUserRole"
              value={settings.defaultUserRole}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="user">{t('settings.system.roles.user')}</option>
              <option value="publisher">{t('settings.system.roles.publisher')}</option>
              <option value="developer">{t('settings.system.roles.developer')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium mb-1">
              {t('settings.system.sessionTimeout')}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                max="1440"
                className="w-24 p-2 border rounded-md bg-background"
              />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {t('settings.system.minutes')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('settings.system.appearance')}</h3>
          
          <div>
            <label htmlFor="defaultLanguage" className="block text-sm font-medium mb-1">
              {t('settings.system.defaultLanguage')}
            </label>
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="defaultTheme" className="block text-sm font-medium mb-1">
              {t('settings.system.defaultTheme')}
            </label>
            <select
              id="defaultTheme"
              name="defaultTheme"
              value={settings.defaultTheme}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="light">{t('settings.system.themes.light')}</option>
              <option value="dark">{t('settings.system.themes.dark')}</option>
              <option value="system">{t('settings.system.themes.system')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="maxUploadSize" className="block text-sm font-medium mb-1">
              {t('settings.system.maxUploadSize')}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="maxUploadSize"
                name="maxUploadSize"
                value={settings.maxUploadSize}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-24 p-2 border rounded-md bg-background"
              />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                MB
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {saveSuccess && (
          <span className="text-sm text-green-500 dark:text-green-400">
            {t('settings.saveSuccess')}
          </span>
        )}
        <button
          type="button"
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setSettings(initialSettings)}
          disabled={isSaving}
        >
          {t('settings.reset')}
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('settings.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('settings.save')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}