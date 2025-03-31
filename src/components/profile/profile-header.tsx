'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Edit, Camera } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  image?: string | null;
  joinDate: Date;
}

export function ProfileHeader({ name, email, image, joinDate }: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  
  const defaultAvatar = 'https://via.placeholder.com/150';
  const avatarSrc = image || defaultAvatar;
  
  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };
  
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };
  
  const handleSaveProfile = () => {
    // Here would be the logic to save profile changes
    setIsEditing(false);
  };
  
  return (
    <div className="card p-6">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <Image 
              src={avatarSrc} 
              alt={name} 
              width={96} 
              height={96} 
              className="object-cover w-full h-full"
            />
          </div>
          <button 
            className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full"
            aria-label={t('changeAvatar')}
          >
            <Camera size={16} />
          </button>
        </div>
        
        <h2 className="text-xl font-bold mb-1">{name}</h2>
        <p className="text-muted-foreground mb-4">{email}</p>
        
        {isEditing ? (
          <div className="w-full space-y-4">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                {t('bio')}
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={handleBioChange}
                className="w-full p-2 border border-input rounded-md bg-background"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 border border-input rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleEditProfile}
            className="flex items-center text-primary hover:underline"
          >
            <Edit size={16} className="mr-1" />
            {t('editProfile')}
          </button>
        )}
      </div>
    </div>
  );
}