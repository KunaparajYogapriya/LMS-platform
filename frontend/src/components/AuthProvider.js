'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function AuthProvider({ children }) {
  const { hydrate, isLoading } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-400">Loading Configuration...</div>;
  }

  return <>{children}</>;
}
