'use client';

import { createClient } from '@/utils/supabase/client';
import { AdminDashboardWrapper } from '@/components/admin-dashboard/AdminDashboardWrapper';
import { useEffect, useState } from 'react';
import { LuLoader } from 'react-icons/lu';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  pendingTimesheets: number;
  pendingTimeoffs: number;
  totalHours: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const [
          { count: totalUsers },
          { count: totalProjects },
          { count: pendingTimesheets },
          { count: pendingTimeoffs },
          { data: timeEntries },
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase
            .from('timesheet_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'submitted'),
          supabase
            .from('time_off_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'submitted'),
          supabase.from('timesheet_weeks').select('total_hours'),
        ]);

        const totalHours =
          timeEntries?.reduce(
            (sum, entry) => sum + (entry.total_hours || 0),
            0,
          ) || 0;

        setStats({
          totalUsers: totalUsers || 0,
          totalProjects: totalProjects || 0,
          pendingTimesheets: pendingTimesheets || 0,
          pendingTimeoffs: pendingTimeoffs || 0,
          totalHours,
        });
      } catch (err) {
        console.error('[AdminDashboard] Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            {error || 'Failed to load dashboard data'}
          </h3>
        </div>
      </div>
    );
  }

  return <AdminDashboardWrapper stats={stats} />;
}
