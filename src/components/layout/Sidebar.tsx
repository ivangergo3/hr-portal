"use client";

import { User } from "@/types/database.types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuClock,
  LuCalendarDays,
  LuUsers,
  LuBriefcase,
  LuBuilding,
  LuTriangleAlert,
} from "react-icons/lu";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setError(null);
        const { data: userData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (roleError) {
          console.error("[Sidebar] Role fetch error:", roleError.message);
          setError("Unable to load navigation. Please refresh the page.");
          return;
        }

        setUserRole(userData?.role || null);
      } catch (error) {
        console.error("[Sidebar] Data fetch error:", error);
        setError("An unexpected error occurred. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user.id, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full rounded-md bg-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <LuTriangleAlert className="h-8 w-8 text-red-500" />
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LuLayoutDashboard,
    },
    {
      name: "Timesheets",
      href: "/timesheets",
      icon: LuClock,
    },
    {
      name: "Time Off",
      href: "/time-off",
      icon: LuCalendarDays,
    },
    ...(userRole === "admin"
      ? [
          {
            name: "Users",
            href: "/users",
            icon: LuUsers,
          },
          {
            name: "Projects",
            href: "/admin/projects",
            icon: LuBriefcase,
          },
          {
            name: "Clients",
            href: "/admin/clients",
            icon: LuBuilding,
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
