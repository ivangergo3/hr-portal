'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileHeader } from './ProfileHeader';
import { ProfileContent } from './ProfileContent';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileWrapper() {
  const { dbUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState({
    full_name: dbUser?.full_name || '',
    email: dbUser?.email || '',
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, authLoading, router]);

  // Update form data when user data changes
  useEffect(() => {
    if (dbUser) {
      setFormData({
        full_name: dbUser.full_name || '',
        email: dbUser.email || '',
      });
    }
  }, [dbUser]);

  const handleSuccess = () => {
    setIsLoading(true);
    router.refresh();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render anything if not authenticated or still loading
  if (authLoading || !dbUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ProfileHeader
        isLoading={isLoading}
        formData={formData}
        user={dbUser}
        onSuccess={handleSuccess}
        setError={setError}
        setIsLoading={setIsLoading}
      />

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad) && <LoadingSkeleton />}
          <ProfileContent
            formData={formData}
            onChange={handleChange}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
