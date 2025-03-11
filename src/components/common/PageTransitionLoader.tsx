'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LuLoader } from 'react-icons/lu';

interface PageTransitionLoaderProps {
  manualLoading?: boolean;
  timeoutMs?: number;
}

export function PageTransitionLoader({
  manualLoading,
  timeoutMs = 5000,
}: PageTransitionLoaderProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const initialRenderRef = useRef(true);
  const prevPathRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle route changes
  useEffect(() => {
    // Skip if manual loading is provided
    if (manualLoading !== undefined) {
      return;
    }

    // Skip the initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      prevPathRef.current = pathname + searchParams.toString();
      return;
    }

    // Get current path
    const currentPath = pathname + searchParams.toString();

    // Skip if the path hasn't changed
    if (currentPath === prevPathRef.current) {
      return;
    }

    // Update previous path
    prevPathRef.current = currentPath;

    // Show loading indicator
    setLoading(true);

    // Create a timeout to hide the loading indicator
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, manualLoading]);

  // Safety timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    if (!(loading || manualLoading)) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set a new safety timeout
    timeoutRef.current = setTimeout(() => {
      console.log(
        '[PageTransitionLoader] Safety timeout triggered - resetting loading state',
      );
      setLoading(false);
    }, timeoutMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loading, manualLoading, timeoutMs]);

  // If not loading (either manually or from route change), don't render anything
  if (!(loading || manualLoading)) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <LuLoader
            className="h-12 w-12 text-slate-700 animate-spin"
            data-testid="page-transition-loader"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-slate-700"></div>
          </div>
        </div>
        <p className="text-slate-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}
