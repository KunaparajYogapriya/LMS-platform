'use client';

import { useEffect } from 'react';
import useSidebarStore from '@/store/sidebarStore';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function SubjectLayout({ children, params }) {
  const { subjectId } = params;
  const { fetchTree } = useSidebarStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTree(subjectId);
  }, [subjectId, fetchTree, user, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar subjectId={subjectId} />
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
