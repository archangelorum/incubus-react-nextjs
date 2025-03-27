'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Save, Loader2, Mail, MessageSquare } from 'lucide-react';

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

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings;
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
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

  const handleSendTestEmail = async () => {
    setTestEmailSent(false);
    
    try {
      // In a real implementation, this would send a test email
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestEmailSent(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setTestEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      // In a real app, you would show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('settings.notifications.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('settings.notifications.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            {t('settings.notifications.emailSettings')}
          </h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm">
              {t('settings.notifications.enableEmail')}
            </label>
          </div>
          
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium mb-1">
              {t('settings.notifications.adminEmail')}
            </label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          
          <div>
            <label htmlFor="emailProvider" className="block text-sm font-medium mb-1">
              {t('settings.notifications.emailProvider')}
            </label>
            <select
              id="emailProvider"
              name="emailProvider"
              value={settings.emailProvider}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!settings.emailNotifications}
            >
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailchimp">Mailchimp</option>
              <option value="ses">Amazon SES</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="emailFromName" className="block text-sm font-medium mb-1">
              {t('settings.notifications.fromName')}
            </label>
            <input
              type="text"
              id="emailFromName"
              name="emailFromName"
              value={settings.emailFromName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!settings.emailNotifications}
            />
          </div>
          
          <div>
            <label htmlFor="emailFromAddress" className="block text-sm font-medium mb-1">
              {t('settings.notifications.fromAddress')}
            </label>
            <input
              type="email"
              id="emailFromAddress"
              name="emailFromAddress"
              value={settings.emailFromAddress}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!settings.emailNotifications}
            />
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleSendTestEmail}
              disabled={!settings.emailNotifications || isSaving}
            >
              {t('settings.notifications.sendTestEmail')}
            </button>
            {testEmailSent && (
              <span className="ml-2 text-sm text-green-500 dark:text-green-400">
                {t('settings.notifications.testEmailSent')}
              </span>
            )}
          </div>
        </div>
        
        {/* Notification Events */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('settings.notifications.events')}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnNewUser"
                name="notifyOnNewUser"
                checked={settings.notifyOnNewUser}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={!settings.emailNotifications}
              />
              <label htmlFor="notifyOnNewUser" className="ml-2 block text-sm">
                {t('settings.notifications.newUser')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnNewPurchase"
                name="notifyOnNewPurchase"
                checked={settings.notifyOnNewPurchase}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={!settings.emailNotifications}
              />
              <label htmlFor="notifyOnNewPurchase" className="ml-2 block text-sm">
                {t('settings.notifications.newPurchase')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnNewReview"
                name="notifyOnNewReview"
                checked={settings.notifyOnNewReview}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={!settings.emailNotifications}
              />
              <label htmlFor="notifyOnNewReview" className="ml-2 block text-sm">
                {t('settings.notifications.newReview')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnError"
                name="notifyOnError"
                checked={settings.notifyOnError}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={!settings.emailNotifications}
              />
              <label htmlFor="notifyOnError" className="ml-2 block text-sm">
                {t('settings.notifications.systemErrors')}
              </label>
            </div>
          </div>
          
          <h3 className="text-md font-medium flex items-center mt-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('settings.notifications.discordSettings')}
          </h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="discordNotifications"
              name="discordNotifications"
              checked={settings.discordNotifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="discordNotifications" className="ml-2 block text-sm">
              {t('settings.notifications.enableDiscord')}
            </label>
          </div>
          
          <div>
            <label htmlFor="discordWebhook" className="block text-sm font-medium mb-1">
              {t('settings.notifications.webhookUrl')}
            </label>
            <input
              type="text"
              id="discordWebhook"
              name="discordWebhook"
              value={settings.discordWebhook}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!settings.discordNotifications}
            />
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