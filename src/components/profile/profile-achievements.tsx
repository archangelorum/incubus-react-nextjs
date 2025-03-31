'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy, Star, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'medal';
  date: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProfileAchievementsProps {
  userId: string;
}

export function ProfileAchievements({ userId }: ProfileAchievementsProps) {
  const t = useTranslations('profile');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockAchievements: Achievement[] = [
          { 
            id: '1', 
            title: 'Early Adopter', 
            description: 'Joined during the platform launch period', 
            icon: 'trophy',
            date: '2024-01-15',
            rarity: 'rare'
          },
          { 
            id: '2', 
            title: 'Game Collector', 
            description: 'Owned 5 different games', 
            icon: 'star',
            date: '2024-02-20',
            rarity: 'common'
          },
          { 
            id: '3', 
            title: 'NFT Enthusiast', 
            description: 'Collected 10 unique in-game items', 
            icon: 'medal',
            date: '2024-03-10',
            rarity: 'epic'
          },
        ];
        
        setAchievements(mockAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, [userId]);
  
  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'medal':
        return <Medal className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'rare':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'epic':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'legendary':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{t('achievements')}</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className="border border-border rounded-lg p-4 flex items-start"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${achievement.rarity === 'legendary' ? 'bg-amber-100 dark:bg-amber-900' : 'bg-primary/10'}`}>
                {getIconComponent(achievement.icon, 'w-5 h-5 text-primary')}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <h4 className="font-medium mr-2">{achievement.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{achievement.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No achievements yet. Keep using the platform to earn achievements.
        </p>
      )}
    </div>
  );
}