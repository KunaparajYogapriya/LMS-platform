'use client';

const VideoMeta = ({ video }) => {
  if (!video) return null;

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{video.description}</p>
    </div>
  );
};

export default VideoMeta;
