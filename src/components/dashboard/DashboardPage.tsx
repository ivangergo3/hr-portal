import { User } from '@/types/database.types';

interface DashboardPageProps {
  user: User;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4 text-slate-900">
        Welcome, {user.full_name || user.email}
      </h1>
      <p className="text-gray-600">
        Select an option from the sidebar to get started.
      </p>
    </div>
  );
}
