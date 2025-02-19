'use client';

import { useState } from 'react';
import { User, Role } from '@/types/database.types';
import { LuLoader } from 'react-icons/lu';
import { format } from 'date-fns';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Notification from '@/components/common/Notification';
import { createClient } from '@/utils/supabase/client';
interface UsersListProps {
  users: User[];
  currentUserId: string;
}

export default function UsersList({ users, currentUserId }: UsersListProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const supabase = createClient();

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) {
        console.error('[UsersList] Role update error:', updateError.message);
        setError('Failed to update user role');
        return;
      }

      setNotification({
        message: 'User role updated successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('[UsersList] Update error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setNotification({
        message: 'User role updated successfully',
        type: 'success',
      });

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating user role:', error);
      setNotification({
        message: 'Failed to update user role',
        type: 'error',
      });
    } finally {
      setShowConfirm(false);
      setSelectedUser(null);
      setNewRole(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/10 flex items-center justify-center">
          <LuLoader className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                      {user.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as Role)
                        }
                        className={`rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900 ${
                          user.id === currentUserId
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
                        disabled={user.id === currentUserId}
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedUser(null);
          setNewRole(null);
        }}
        onConfirm={updateUserRole}
        title="Change User Role"
        message={`Are you sure you want to change ${selectedUser?.full_name}'s role to ${newRole}? This action cannot be undone.`}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
