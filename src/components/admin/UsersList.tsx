'use client';

import { User, Role } from '@/types/database.types';
import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import { createClientServer } from '@/utils/supabase/server';

interface UsersListProps {
  initialUsers: User[];
  currentUserId: string;
}

export default function UsersList({
  initialUsers,
  currentUserId,
}: UsersListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientServer();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={3} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        message="There are no users in the system."
      />
    );
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setIsUpdating(true);
      setError(null);

      if (userId !== currentUserId) {
        throw new Error('You can only edit your own role');
      }

      const { error: updateError } = await (await supabase)
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) throw updateError;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error('[UsersList] Role update error:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update role',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            A list of all users in the system.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-slate-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">
                      {user.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as Role)
                        }
                        disabled={isUpdating || user.id !== currentUserId}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
