'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { UserX2 } from 'lucide-react';

export function StopImpersonationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');
  const { isImpersonating, stopImpersonating } = useAuth();

  const handleStopImpersonating = async () => {
    try {
      setIsLoading(true);
      
      // Use the stopImpersonating function from AuthProvider
      await stopImpersonating();

      // Redirect to the admin users page
      router.push('/admin/users');
    } catch (err) {
      console.error('Error stopping impersonation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show the button if the user is being impersonated
  if (!isImpersonating()) {
    return null;
  }

  return (
    <button
      onClick={handleStopImpersonating}
      disabled={isLoading}
      className="fixed bottom-4 right-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500 z-50"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
      ) : (
        <UserX2 className="w-4 h-4 mr-2" />
      )}
      {t('users.impersonate.stop')}
    </button>
  );
}