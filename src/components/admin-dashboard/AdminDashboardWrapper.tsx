import { Suspense } from 'react';
import { AdminDashboardHeader } from './AdminDashboardHeader';
import { AdminDashboardContent } from './admin-dashboard-content/AdminDashboardContent';
import DataErrorBoundary from '@/components/common/DataErrorBoundary';
import LoadingSkeleton from '../common/LoadingSkeleton';

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  pendingTimesheets: number;
  pendingTimeoffs: number;
  totalHours: number;
}

interface AdminDashboardWrapperProps {
  stats: DashboardStats;
}

export function AdminDashboardWrapper({ stats }: AdminDashboardWrapperProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminDashboardHeader stats={stats} />
      <DataErrorBoundary>
        <Suspense
          fallback={
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="relative min-h-[200px]">
                <LoadingSkeleton />
              </div>
            </div>
          }
        >
          <AdminDashboardContent />
        </Suspense>
      </DataErrorBoundary>
    </div>
  );
}
