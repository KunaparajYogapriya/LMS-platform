'use client';

import { useEffect, useState } from 'react';
import useVideoStore from '@/store/videoStore';
import useSidebarStore from '@/store/sidebarStore';
import VideoPlayer from '@/components/VideoPlayer';
import VideoMeta from '@/components/VideoMeta';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage({ params }) {
  const { subjectId, videoId } = params;
  const router = useRouter();
  const { 
    currentVideo, 
    isLoading, 
    error, 
    fetchVideo, 
    previousVideoId, 
    nextVideoId, 
    locked,
    updateProgress
  } = useVideoStore();
  const { refreshProgress } = useSidebarStore();

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    fetchVideo(videoId).then(data => {
       if (data && data.locked) {
           router.replace(`/subjects/${subjectId}`);
       }
    });
  }, [videoId, fetchVideo, router, subjectId]);

  const markCompleted = async () => {
    if (currentVideo && !isNavigating) {
      setIsNavigating(true);
      await updateProgress(currentVideo.id, 0, true);
      await refreshProgress(subjectId);
      if (nextVideoId) {
         window.location.href = `/subjects/${subjectId}/video/${nextVideoId}`;
      } else {
         window.location.href = `/subjects/${subjectId}`;
      }
    }
  };

  if (isLoading) return <div className="p-8 w-full h-full flex items-center justify-center animate-pulse text-gray-400">Loading Video...</div>;
  if (error || locked) return <div className="p-8 w-full h-full flex items-center justify-center text-red-500">Error: {error || 'Video is locked'}</div>;
  if (!currentVideo) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <header className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm border-b">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter text-black">NexusLearn</Link>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#111111] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
             <span className="text-orange-400">⚡</span> Active Session
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={!previousVideoId}
            onClick={() => router.push(`/subjects/${subjectId}/video/${previousVideoId}`)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <button 
            disabled={isNavigating}
            onClick={markCompleted}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isNavigating ? 'Saving...' : 'Mark Completed'} <CheckCircle className="w-4 h-4" />
          </button>

          <button 
            disabled={!nextVideoId}
            onClick={() => router.push(`/subjects/${subjectId}/video/${nextVideoId}`)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-5xl mx-auto w-full">
        <VideoPlayer video={currentVideo} subjectId={subjectId} />
        <VideoMeta video={currentVideo} />
      </main>
    </div>
  );
}
