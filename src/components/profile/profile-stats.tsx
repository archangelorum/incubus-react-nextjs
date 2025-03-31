'use client';

import { useTranslations } from 'next-intl';
import { Gamepad2, Package, Calendar } from 'lucide-react';

interface ProfileStatsProps {
  gamesOwned: number;
  itemsOwned: number;
  joinDate: Date;
}

export function ProfileStats({ gamesOwned, itemsOwned, joinDate }: ProfileStatsProps) {
  const t = useTranslations('profile');
  
  // Format the join date
  const formattedDate = new Date(joinDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{t('stats')}</h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('joinDate')}</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('gamesOwned')}</p>
            <p className="font-medium">{gamesOwned}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('itemsOwned')}</p>
            <p className="font-medium">{itemsOwned}</p>
          </div>
        </div>
      </div>
    </div>
  );
}