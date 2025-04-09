import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Link, redirect } from '@/i18n/navigation';
import { UserSessions } from '@/components/admin/users/user-sessions';
import { ImpersonateUserButton } from '@/components/admin/users/impersonate-user-button';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserDetailPageProps {
  params: {
    id: string;
    locale: string;
  };
}

async function getUserDetails(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      _count: {
        select: {
          sessions: true,
          gameReviews: true,
          wallets: true
        }
      }
    }
  });
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const locale = await getLocale();
  params = await params;
  
  const t = await getTranslations('admin');
  
  // Check if user is authenticated and has admin role
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect( { href: '/', locale });
    return;
  }
  
  const user = await getUserDetails(params.id);
  
  if (!user) {
    redirect( { href: '/', locale });
    return;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('users.backToList')}
        </Link>
        <h1 className="text-2xl font-bold">{t('users.userDetails')}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-1" />
                  {user.email}
                  {user.emailVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.role')}</span>
                <span className="text-sm font-medium">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <Shield className="w-3 h-3 mr-1" />
                      {t('users.roles.admin')}
                    </span>
                  ) : user.role ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {t(`users.roles.${user.role.toLowerCase()}`, { fallback: user.role })}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {t('users.roles.standard')}
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.status')}</span>
                <span className="text-sm font-medium">
                  {user.banned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <Ban className="w-3 h-3 mr-1" />
                      {t('users.status.banned')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('users.status.active')}
                    </span>
                  )}
                </span>
              </div>
              
              {user.banned && user.banReason && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.banReason')}</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">{user.banReason}</span>
                </div>
              )}
              
              {user.banned && user.banExpires && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.banExpires')}</span>
                  <span className="text-sm font-medium">{formatDate(user.banExpires)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.joined')}</span>
                <span className="text-sm font-medium flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(user.createdAt)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.lastUpdated')}</span>
                <span className="text-sm font-medium flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(user.updatedAt)}
                </span>
              </div>
              
              <div className="mt-6">
                <ImpersonateUserButton userId={params.id} userName={user.name} />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div className="text-lg font-semibold">{user._count.sessions}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('users.stats.sessions')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div className="text-lg font-semibold">{user._count.wallets}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('users.stats.wallets')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div className="text-lg font-semibold">{user._count.gameReviews}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('users.stats.reviews')}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Sessions */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Suspense fallback={<div>Loading sessions...</div>}>
            <UserSessions userId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}