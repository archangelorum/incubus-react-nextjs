'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { UserSquare2, AlertTriangle } from 'lucide-react';

interface ImpersonateUserButtonProps {
  userId: string;
  userName: string;
}

export function ImpersonateUserButton({ userId, userName }: ImpersonateUserButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('admin');
  const { impersonateUser } = useAuth();

  const handleImpersonateUser = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use the impersonateUser function from AuthProvider
      await impersonateUser(userId);

      // Redirect to the home page as the impersonated user
      router.push('/');
    } catch (err) {
      console.error('Error impersonating user:', err);
      setError(t('users.impersonate.error'));
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      <button
        onClick={handleImpersonateUser}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
          isConfirming
            ? 'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
            : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
        ) : isConfirming ? (
          <AlertTriangle className="w-4 h-4 mr-2" />
        ) : (
          <UserSquare2 className="w-4 h-4 mr-2" />
        )}
        
        {isConfirming
          ? t('users.impersonate.confirm', { name: userName })
          : t('users.impersonate.button')}
      </button>
    </div>
  );
}