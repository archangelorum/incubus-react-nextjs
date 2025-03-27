'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Save, Loader2, Eye, EyeOff, BarChart, CreditCard, Database, ShieldCheck } from 'lucide-react';

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

interface IntegrationSettingsFormProps {
  initialSettings: IntegrationSettings;
}

export function IntegrationSettingsForm({ initialSettings }: IntegrationSettingsFormProps) {
  const [settings, setSettings] = useState<IntegrationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const t = useTranslations('admin');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowSecret = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
        <h2 className="text-lg font-semibold mb-4">{t('settings.integrations.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('settings.integrations.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analytics & Security */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium flex items-center">
              <BarChart className="w-4 h-4 mr-2" />
              {t('settings.integrations.analytics')}
            </h3>
            
            <div>
              <label htmlFor="googleAnalyticsId" className="block text-sm font-medium mb-1">
                {t('settings.integrations.googleAnalyticsId')}
              </label>
              <input
                type="text"
                id="googleAnalyticsId"
                name="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={handleChange}
                placeholder="UA-XXXXXXXXX-X"
                className="w-full p-2 border rounded-md bg-background"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('settings.integrations.googleAnalyticsHelp')}
              </p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t('settings.integrations.recaptcha')}
            </h3>
            
            <div>
              <label htmlFor="recaptchaSiteKey" className="block text-sm font-medium mb-1">
                {t('settings.integrations.recaptchaSiteKey')}
              </label>
              <input
                type="text"
                id="recaptchaSiteKey"
                name="recaptchaSiteKey"
                value={settings.recaptchaSiteKey}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="recaptchaSecretKey" className="block text-sm font-medium mb-1">
                {t('settings.integrations.recaptchaSecretKey')}
              </label>
              <div className="relative">
                <input
                  type={showSecrets.recaptchaSecretKey ? 'text' : 'password'}
                  id="recaptchaSecretKey"
                  name="recaptchaSecretKey"
                  value={settings.recaptchaSecretKey}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => toggleShowSecret('recaptchaSecretKey')}
                >
                  {showSecrets.recaptchaSecretKey ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Integration */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              {t('settings.integrations.payments')}
            </h3>
            
            <div>
              <label htmlFor="stripePublicKey" className="block text-sm font-medium mb-1">
                {t('settings.integrations.stripePublicKey')}
              </label>
              <input
                type="text"
                id="stripePublicKey"
                name="stripePublicKey"
                value={settings.stripePublicKey}
                onChange={handleChange}
                placeholder="pk_test_..."
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="stripeSecretKey" className="block text-sm font-medium mb-1">
                {t('settings.integrations.stripeSecretKey')}
              </label>
              <div className="relative">
                <input
                  type={showSecrets.stripeSecretKey ? 'text' : 'password'}
                  id="stripeSecretKey"
                  name="stripeSecretKey"
                  value={settings.stripeSecretKey}
                  onChange={handleChange}
                  placeholder="sk_test_..."
                  className="w-full p-2 border rounded-md bg-background pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => toggleShowSecret('stripeSecretKey')}
                >
                  {showSecrets.stripeSecretKey ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('settings.integrations.stripeHelp')}
              </p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              {t('settings.integrations.blockchain')}
            </h3>
            
            <div>
              <label htmlFor="polygonRpcUrl" className="block text-sm font-medium mb-1">
                {t('settings.integrations.polygonRpcUrl')}
              </label>
              <input
                type="text"
                id="polygonRpcUrl"
                name="polygonRpcUrl"
                value={settings.polygonRpcUrl}
                onChange={handleChange}
                placeholder="https://polygon-rpc.com"
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="ipfsGateway" className="block text-sm font-medium mb-1">
                {t('settings.integrations.ipfsGateway')}
              </label>
              <input
                type="text"
                id="ipfsGateway"
                name="ipfsGateway"
                value={settings.ipfsGateway}
                onChange={handleChange}
                placeholder="https://ipfs.io/ipfs/"
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="ipfsApiKey" className="block text-sm font-medium mb-1">
                {t('settings.integrations.ipfsApiKey')}
              </label>
              <div className="relative">
                <input
                  type={showSecrets.ipfsApiKey ? 'text' : 'password'}
                  id="ipfsApiKey"
                  name="ipfsApiKey"
                  value={settings.ipfsApiKey}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => toggleShowSecret('ipfsApiKey')}
                >
                  {showSecrets.ipfsApiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
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