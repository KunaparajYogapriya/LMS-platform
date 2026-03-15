'use client';

import { useEffect } from 'react';
import useSidebarStore from '@/store/sidebarStore';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';

export default function SubjectPage({ params }) {
  const { subjectId } = params;
  const { subjectTree, subject, isLoading } = useSidebarStore();
  const router = useRouter();

  useEffect(() => {
    // Optional auto-redirect to first valid video
    if (!isLoading && subjectTree?.length > 0) {
      let firstAvailable = null;
      for (const section of subjectTree) {
        for (const video of section.videos) {
          if (!video.locked) {
             firstAvailable = video;
             if (!video.is_completed) {
                // Return first incomplete available video
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

  if (isLoading) return <div className="p-8">Analyzing curriculum...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{subject?.title} Curriculum</h1>
      <ProgressBar subjectTree={subjectTree} />
      <div className="mt-8 text-gray-500">Select a video from the sidebar to start learning.</div>
    </div>
  );
}
