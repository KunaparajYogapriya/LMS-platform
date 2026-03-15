'use client';

import { CheckCircle } from 'lucide-react';

const ProgressBar = ({ subjectTree }) => {
  if (!subjectTree || subjectTree.length === 0) return null;

  let totalVideos = 0;
  let completedVideos = 0;

  subjectTree.forEach(section => {
    section.videos.forEach(video => {
      totalVideos++;
      if (video.is_completed) completedVideos++;
    });
  });

  const percentage = totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">Course Progress</span>
          <span className="text-sm font-bold text-blue-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
      {percentage === 100 && (
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
