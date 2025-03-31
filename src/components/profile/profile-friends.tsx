'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UserPlus, UserMinus, UserX } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  image: string;
}

interface ProfileFriendsProps {
  userId: string;
}

export function ProfileFriends({ userId }: ProfileFriendsProps) {
  const t = useTranslations('profile');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockFriends: Friend[] = [
          { id: '1', name: 'Alex Johnson', image: 'https://via.placeholder.com/40' },
          { id: '2', name: 'Sam Wilson', image: 'https://via.placeholder.com/40' },
          { id: '3', name: 'Taylor Kim', image: 'https://via.placeholder.com/40' },
        ];
        
        setFriends(mockFriends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFriends();
  }, [userId]);
  
  const handleAddFriend = () => {
    // Logic to add a friend
  };
  
  const handleRemoveFriend = (friendId: string) => {
    // Logic to remove a friend
    setFriends(friends.filter(friend => friend.id !== friendId));
  };
  
  const handleBlockUser = (friendId: string) => {
    // Logic to block a user
    setFriends(friends.filter(friend => friend.id !== friendId));
  };
  
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('friends')}</h3>
        <button 
          onClick={handleAddFriend}
          className="text-primary hover:text-primary/80 flex items-center text-sm"
        >
          <UserPlus size={16} className="mr-1" />
          {t('addFriend')}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : friends.length > 0 ? (
        <ul className="space-y-3">
          {friends.map(friend => (
            <li key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image 
                    src={friend.image} 
                    alt={friend.name} 
                    width={40} 
                    height={40} 
                    className="object-cover"
                  />
                </div>
                <span>{friend.name}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label={t('removeFriend')}
                >
                  <UserMinus size={16} />
                </button>
                <button 
                  onClick={() => handleBlockUser(friend.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t('blockUser')}
                >
                  <UserX size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No friends yet. Add some friends to see them here.
        </p>
      )}
    </div>
  );
}