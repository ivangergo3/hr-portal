'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LuClock,
  LuCalendarDays,
  LuLayoutDashboard,
  LuBuilding,
  LuFolderClosed,
  LuUsers,
  LuClipboardCheck,
  LuCalendarClock,
} from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navigation: MenuItem[] = [
  { name: 'Timesheets', href: '/timesheets', icon: LuClock },
  { name: 'Time Off', href: '/time-off', icon: LuCalendarDays },
];

const adminNavigation = [
  {
    name: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LuLayoutDashboard,
  },
  {
    name: 'Timesheet Approvals',
    href: '/admin/timesheets',
    icon: LuClipboardCheck,
  },
  {
    name: 'Time Off Approvals',
    href: '/admin/time-off',
    icon: LuCalendarClock,
  },
  { name: 'Clients', href: '/admin/clients', icon: LuBuilding },
  { name: 'Projects', href: '/admin/projects', icon: LuFolderClosed },
  { name: 'Users', href: '/admin/users', icon: LuUsers },
];

const MenuItems = ({
  pathname,
  item,
}: {
  pathname: string;
  item: MenuItem;
}) => {
  const isActive = pathname === item.href;
  return (
    <li key={item.name}>
      <Link
        href={item.href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
          isActive
            ? 'bg-slate-200 text-slate-900'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
        data-testid={`sidebar-${item.name.toLowerCase().replace(/\s+/g, '-')}-link`}
      >
        <item.icon className="h-5 w-5" />
        {item.name}
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, dbUser, isAdmin } = useAuth();

  if (!user || !dbUser) {
    return null;
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-50 border-r border-slate-200">
      <div className="flex h-16 items-center px-4 border-b border-slate-200">
        <Link href="/dashboard" data-testid="sidebar-hr=portal-logo">
          <h1 className="text-xl font-bold text-slate-800">HR Portal</h1>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            return (
              <MenuItems key={item.name} pathname={pathname} item={item} />
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="mt-8 mb-2 px-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </h2>
            </div>
            <ul className="space-y-1">
              {adminNavigation.map((item) => {
                return (
                  <MenuItems key={item.name} pathname={pathname} item={item} />
                );
              })}
            </ul>
          </>
        )}
      </nav>
    </div>
  );
}
