'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import useSidebarStore from '@/store/sidebarStore';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';

export default function SubjectPage({ params }) {
  const { subjectId } = params;
  const { subjectTree, subject, isLoading } = useSidebarStore();
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    // Optional auto-redirect to first valid video
    if (!isLoading && subjectTree?.length > 0) {
      let firstAvailable = null;
      for (const section of subjectTree) {
        for (const video of section.videos) {
          if (!video.locked) {
             firstAvailable = video;
             if (!video.is_completed) {
                router.replace(`/subjects/${subjectId}/video/${video.id}`);
                return;
             }
          }
        }
      }
      if (firstAvailable) {
         router.replace(`/subjects/${subjectId}/video/${firstAvailable.id}`);
      }
    }
  }, [isLoading, subjectTree, router, subjectId]);

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{subject?.title} Curriculum</h1>
      <ProgressBar subjectTree={subjectTree} />
      <div className="mt-8 text-gray-500">Select a video from the sidebar to start learning.</div>
    </div>
  );
}
