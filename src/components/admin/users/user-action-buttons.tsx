'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Ban, 
  UserCheck, 
  Shield, 
  User,
  AlertTriangle
} from 'lucide-react';

interface UserActionButtonsProps {
  userId: string;
}

export function UserActionButtons({ userId }: UserActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingBan, setIsConfirmingBan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  const handleEdit = () => {
    router.push(`/admin/users/${userId}`);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh the page to show updated user list
      router.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
      setIsConfirmingDelete(false);
      setIsOpen(false);
    }
  };

  const handleBanUser = async () => {
    if (!isConfirmingBan) {
      setIsConfirmingBan(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned: true,
          banReason: 'Administrative action',
          // Ban for 30 days by default
          banExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      // Refresh the page to show updated user status
      router.refresh();
    } catch (error) {
      console.error('Error banning user:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
      setIsConfirmingBan(false);
      setIsOpen(false);
    }
  };

  const handleUnbanUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned: false,
          banReason: null,
          banExpires: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unban user');
      }

      // Refresh the page to show updated user status
      router.refresh();
    } catch (error) {
      console.error('Error unbanning user:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handlePromoteToAdmin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to promote user to admin');
      }

      // Refresh the page to show updated user role
      router.refresh();
    } catch (error) {
      console.error('Error promoting user:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleRemoveAdminRole = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove admin role');
      }

      // Refresh the page to show updated user role
      router.refresh();
    } catch (error) {
      console.error('Error removing admin role:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (isOpen) {
      setIsOpen(false);
      setIsConfirmingDelete(false);
      setIsConfirmingBan(false);
    }
  };

  return (
    <div className="relative">
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={handleClickOutside}
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label={t('users.actions.options')}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={handleEdit}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              disabled={isLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('users.actions.edit')}
            </button>
            
            <button
              onClick={handlePromoteToAdmin}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              disabled={isLoading}
            >
              <Shield className="w-4 h-4 mr-2" />
              {t('users.actions.promoteToAdmin')}
            </button>
            
            <button
              onClick={handleRemoveAdminRole}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              disabled={isLoading}
            >
              <User className="w-4 h-4 mr-2" />
              {t('users.actions.removeAdminRole')}
            </button>
            
            <button
              onClick={handleBanUser}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                isConfirmingBan 
                  ? 'text-red-600 dark:text-red-400 font-medium' 
                  : 'text-gray-700 dark:text-gray-200'
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
              disabled={isLoading}
            >
              {isConfirmingBan ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('users.actions.confirmBan')}
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  {t('users.actions.ban')}
                </>
              )}
            </button>
            
            <button
              onClick={handleUnbanUser}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              disabled={isLoading}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {t('users.actions.unban')}
            </button>
            
            <button
              onClick={handleDelete}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                isConfirmingDelete 
                  ? 'text-red-600 dark:text-red-400 font-medium' 
                  : 'text-gray-700 dark:text-gray-200'
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
              disabled={isLoading}
            >
              {isConfirmingDelete ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('users.actions.confirmDelete')}
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  {t('users.actions.delete')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}