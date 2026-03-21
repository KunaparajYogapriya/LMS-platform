'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import useSidebarStore from '@/store/sidebarStore';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';

export default function SubjectPage({ params }) {
  const { subjectId } = params;
  const { fetchTree, subjectTree, subject, isLoading, error } = useSidebarStore();
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchTree(subjectId);
  }, [subjectId, fetchTree]);

  useEffect(() => {
    // Optional auto-redirect to first valid video.
    // CRITICAL: We explicitly verify the loaded subject.id matches our route param
    // BEFORE redirecting, to prevent stale state from a previous course triggering the redirect.
    if (!isLoading && !error && subjectTree?.length > 0 && subject?.id === Number(subjectId)) {
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
  }, [isLoading, error, subjectTree, router, subjectId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiClient.post(`/subjects/${subjectId}/enroll`);
      await fetchTree(subjectId);
    } catch (err) {
      console.error('Enrollment failed', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div></div>;

  if (error === 'Not Enrolled' || (subject && !subject.isEnrolled)) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 shadow-sm">
          <BookOpen className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 select-none">
          Ready to start <span className="text-blue-600">{subject?.title || 'this course'}</span>?
        </h1>
        <p className="text-gray-500 max-w-md font-bold mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
          Join thousands of students and unlock full access to the videos, source code, and progress tracking.
        </p>
        <button 
          onClick={handleEnroll}
          disabled={enrolling}
          className={`group flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {enrolling ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="flex items-center gap-2 uppercase tracking-widest text-sm">
              Enroll in Course <PlayCircle className="w-5 h-5 ml-1" />
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto w-full min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{subject?.title}</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Course Curriculum</p>
      </div>
      
      {subjectTree && (
        <div className="space-y-12">
           <ProgressBar subjectTree={subjectTree} />
           <div className="grid gap-10">
             <div className="flex flex-col gap-6">
                <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
                  {subject?.description}
                </p>
             </div>
             <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-bold text-blue-900 mb-1">Get Started</h3>
                   <p className="text-blue-700 text-sm font-medium">Select a video from the sidebar to begin your journey.</p>
                </div>
                <PlayCircle className="w-10 h-10 text-blue-600 animate-pulse" />
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

function BookOpen({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function PlayCircle({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  );
}
