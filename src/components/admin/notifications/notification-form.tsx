'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Send, Loader2 } from 'lucide-react';

interface UserGroup {
  id: string;
  name: string;
  count: number;
}

interface NotificationFormProps {
  userGroups: UserGroup[];
}

export function NotificationForm({ userGroups }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetGroup: 'all',
    sendEmail: false,
    sendPush: false,
    sendInApp: true,
    scheduledDate: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccess(false);
    
    try {
      // In a real implementation, this would send the notification to the server
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetGroup: 'all',
        sendEmail: false,
        sendPush: false,
        sendInApp: true,
        scheduledDate: ''
      });
      
      // Show success message
      setSendSuccess(true);
      
      // Refresh the page to show the new notification
      router.refresh();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              {t('notifications.form.title')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              {t('notifications.form.message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              {t('notifications.form.type')}
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="info">{t('notifications.form.types.info')}</option>
              <option value="success">{t('notifications.form.types.success')}</option>
              <option value="warning">{t('notifications.form.types.warning')}</option>
              <option value="error">{t('notifications.form.types.error')}</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="targetGroup" className="block text-sm font-medium mb-1">
              {t('notifications.form.targetGroup')}
            </label>
            <select
              id="targetGroup"
              name="targetGroup"
              value={formData.targetGroup}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              {userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.count} {t('notifications.form.users')})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium mb-1">
              {t('notifications.form.scheduledDate')} ({t('notifications.form.optional')})
            </label>
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('notifications.form.scheduledDateHelp')}
            </p>
          </div>
          
          <div>
            <p className="block text-sm font-medium mb-2">
              {t('notifications.form.deliveryChannels')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendInApp"
                  name="sendInApp"
                  checked={formData.sendInApp}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="sendInApp" className="ml-2 block text-sm">
                  {t('notifications.form.inApp')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendEmail"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="sendEmail" className="ml-2 block text-sm">
                  {t('notifications.form.email')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendPush"
                  name="sendPush"
                  checked={formData.sendPush}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="sendPush" className="ml-2 block text-sm">
                  {t('notifications.form.push')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {sendSuccess && (
          <span className="text-sm text-green-500 dark:text-green-400">
            {t('notifications.form.sendSuccess')}
          </span>
        )}
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ml-auto"
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('notifications.form.sending')}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t('notifications.form.send')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}