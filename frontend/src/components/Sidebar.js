'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle, Lock, ChevronLeft } from 'lucide-react';
import useSidebarStore from '../store/sidebarStore';

const Sidebar = ({ subjectId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { subjectTree, subject, isLoading, error } = useSidebarStore();

  if (isLoading) return <div className="p-4 w-64 border-r h-full animate-pulse bg-gray-50 flex-shrink-0">Loading...</div>;
  if (error) return <div className="p-4 w-64 border-r h-full bg-red-50 text-red-500 flex-shrink-0">{error}</div>;

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col overflow-y-auto flex-shrink-0">
      <div className="p-6 border-b sticky top-0 bg-white z-10 flex flex-col gap-3">
        <button onClick={() => router.push('/subjects')} className="text-sm font-medium text-gray-400 hover:text-gray-900 flex items-center gap-1.5 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{subject?.title || 'Subject'}</h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{subject?.description}</p>
        </div>
      </div>

      <div className="flex-1 py-4">
        {subjectTree.map((section, idx) => (
          <div key={section.id} className="mb-6">
            <h3 className="px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Section {idx + 1}: {section.title}
            </h3>
            <ul className="space-y-1">
              {section.videos.map((video) => {
                const isActive = pathname.includes(`/video/${video.id}`);
                const isLocked = video.locked;
                const isCompleted = video.is_completed;

                return (
                  <li key={video.id}>
                    <button
                      disabled={isLocked}
                      onClick={() => !isLocked && router.push(`/subjects/${subjectId}/video/${video.id}`)}
                      className={`w-full text-left px-6 py-3 flex items-start gap-3 transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                          : isLocked 
                            ? 'text-gray-400 cursor-not-allowed opacity-60' 
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mt-0.5 mt-1 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <PlayCircle className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-sm font-medium ${isActive ? 'text-blue-700' : ''} ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                          {video.title}
                        </span>
                        {video.duration_seconds > 0 && (
                          <span className="text-xs text-gray-400 block mt-1">
                            {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')} min
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
