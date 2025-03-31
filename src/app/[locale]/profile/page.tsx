import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileActivity } from '@/components/profile/profile-activity';
import { ProfileFriends } from '@/components/profile/profile-friends';
import { ProfileAchievements } from '@/components/profile/profile-achievements';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { headers } from 'next/headers';

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const session = await auth.api.getSession({
      headers: await headers()
    })
  
  if (!session || !session.user) {
    notFound();
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallets: {
        include: {
          ownedLicenses: true,
          ownedItems: true,
        }
      },
    }
  });
  
  if (!user) {
    notFound();
  }
  
  // Calculate stats
  const gamesOwned = user.wallets.reduce((acc, wallet) => acc + wallet.ownedLicenses.length, 0);
  const itemsOwned = user.wallets.reduce((acc, wallet) => acc + wallet.ownedItems.length, 0);
  
  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('myProfile')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile info and stats */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={<div className="card p-6 h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
              <ProfileHeader 
                name={user.name}
                email={user.email}
                image={user.image}
                joinDate={user.createdAt}
              />
            </Suspense>
            
            <Suspense fallback={<div className="card p-6 h-48 flex items-center justify-center"><LoadingSpinner /></div>}>
              <ProfileStats 
                gamesOwned={gamesOwned}
                itemsOwned={itemsOwned}
                joinDate={user.createdAt}
              />
            </Suspense>
            
            <Suspense fallback={<div className="card p-6 h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
              <ProfileFriends userId={user.id} />
            </Suspense>
          </div>
          
          {/* Right column - Achievements and activity */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="card p-6 h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
              <ProfileAchievements userId={user.id} />
            </Suspense>
            
            <Suspense fallback={<div className="card p-6 h-96 flex items-center justify-center"><LoadingSpinner /></div>}>
              <ProfileActivity userId={user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}