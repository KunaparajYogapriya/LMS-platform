'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profile</h1>
        <Link href="/subjects" className="text-sm font-medium text-blue-600 hover:text-blue-700"> Back to Dashboard </Link>
      </header>
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl mb-4">
               {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</h2>
              <p className="text-lg font-medium text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">User ID</h2>
              <p className="text-lg font-medium text-gray-900 mt-1">#{user.id}</p>
            </div>
            <div className="pt-6 border-t mt-4">
              <button onClick={logout} className="w-full sm:w-auto px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors">
                Sign Out
              </button>
            </div>
        </div>
      </main>
    </div>
  );
}
