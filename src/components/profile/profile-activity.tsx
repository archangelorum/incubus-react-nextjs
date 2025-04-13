'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Gift, Award, Gamepad2, Package } from 'lucide-react';

interface Activity {
  id: string;
  type: 'purchase' | 'achievement' | 'gameplay' | 'item' | 'gift';
  title: string;
  description: string;
  date: string;
}

interface ProfileActivityProps {
  userId: string;
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const t = useTranslations('profile');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockActivities: Activity[] = [
          { 
            id: '1', 
            type: 'purchase', 
            title: 'Purchased Cyberpunk 2077', 
            description: 'Added to your game library', 
            date: '2024-03-25T14:30:00Z'
          },
          { 
            id: '2', 
            type: 'achievement', 
            title: 'Unlocked "First Steps" Achievement', 
            description: 'In Elden Ring', 
            date: '2024-03-24T20:15:00Z'
          },
          { 
            id: '3', 
            type: 'gameplay', 
            title: 'Played Fortnite', 
            description: 'For 2 hours', 
            date: '2024-03-23T18:45:00Z'
          },
          { 
            id: '4', 
            type: 'item', 
            title: 'Acquired Legendary Sword', 
            description: 'In World of Warcraft', 
            date: '2024-03-22T12:10:00Z'
          },
          { 
            id: '5', 
            type: 'gift', 
            title: 'Received Stardew Valley', 
            description: 'Gift from Alex Johnson', 
            date: '2024-03-20T09:30:00Z'
          },
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="w-5 h-5 text-primary" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-primary" />;
      case 'gameplay':
        return <Gamepad2 className="w-5 h-5 text-primary" />;
      case 'item':
        return <Package className="w-5 h-5 text-primary" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-primary" />;
      default:
        return <Gamepad2 className="w-5 h-5 text-primary" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Less than a day ago
      const hours = Math.floor(diffInHours);
      if (hours === 0) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // More than 2 days ago
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{t('recentActivity')}</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 border-b border-[hsl(var(--border))] pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No recent activity. Your activities will appear here.
        </p>
      )}
    </div>
  );
}