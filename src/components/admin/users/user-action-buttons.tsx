'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
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
  const { removeUser, banUser, unbanUser, setUserRole } = useAuth();

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
      
      // Use the removeUser function from AuthProvider
      await removeUser(userId);

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
      
      // Use the banUser function from AuthProvider
      // Ban for 30 days by default
      await banUser(
        userId,
        'Administrative action',
        30 * 24 * 60 * 60 // 30 days in seconds
      );

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
      
      // Use the unbanUser function from AuthProvider
      await unbanUser(userId);

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
      
      // Use the setUserRole function from AuthProvider
      await setUserRole(userId, 'admin');

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
      
      // Use the setUserRole function from AuthProvider
      await setUserRole(userId, 'user');

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