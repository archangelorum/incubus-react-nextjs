'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Globe, 
  Clock, 
  XCircle,
  RefreshCw
} from 'lucide-react';

interface Session {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
}

interface UserSessionsProps {
  userId: string;
}

export function UserSessions({ userId }: UserSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const { listUserSessions, revokeUserSession, revokeUserSessions } = useAuth();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the listUserSessions function from AuthProvider
      const response = await listUserSessions(userId);
      
      // Make sure we're handling the response correctly
      if (response && Array.isArray(response)) {
        setSessions(response as Session[]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching user sessions:', err);
      setError(t('users.sessions.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      // Use the revokeUserSession function from AuthProvider
      await revokeUserSession(sessionToken);
      
      // Refresh the sessions list
      fetchSessions();
    } catch (err) {
      console.error('Error revoking session:', err);
      setError(t('users.sessions.revokeError'));
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      // Use the revokeUserSessions function from AuthProvider
      await revokeUserSessions(userId);
      
      // Refresh the sessions list
      fetchSessions();
    } catch (err) {
      console.error('Error revoking all sessions:', err);
      setError(t('users.sessions.revokeAllError'));
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="w-4 h-4" />;
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('android') && ua.includes('mobile')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (ua.includes('ipad') || ua.includes('android') && !ua.includes('mobile')) {
      return <Tablet className="w-4 h-4" />;
    } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      return <Laptop className="w-4 h-4" />;
    } else {
      return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return t('users.sessions.unknownDevice');
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone')) {
      return 'iPhone';
    } else if (ua.includes('ipad')) {
      return 'iPad';
    } else if (ua.includes('android') && ua.includes('mobile')) {
      return 'Android Phone';
    } else if (ua.includes('android')) {
      return 'Android Tablet';
    } else if (ua.includes('windows')) {
      return 'Windows PC';
    } else if (ua.includes('macintosh')) {
      return 'Mac';
    } else if (ua.includes('linux')) {
      return 'Linux';
    } else {
      return t('users.sessions.unknownDevice');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
            <div className="mt-2">
              <button
                onClick={fetchSessions}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t('users.sessions.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">{t('users.sessions.noSessions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('users.sessions.title')}</h3>
        <button
          onClick={handleRevokeAllSessions}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <XCircle className="w-3 h-3 mr-1" />
          {t('users.sessions.revokeAll')}
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.map((session) => (
            <li key={session.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getDeviceName(session.userAgent)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.ipAddress || t('users.sessions.unknownIP')}
                    </div>
                    {session.impersonatedBy && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        {t('users.sessions.impersonated')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('users.sessions.created')}: {formatDate(session.createdAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('users.sessions.expires')}: {formatDate(session.expiresAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.token)}
                    className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title={t('users.sessions.revoke')}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}