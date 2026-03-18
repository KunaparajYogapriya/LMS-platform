'use client';

import React, { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import useVideoStore from '../store/videoStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/axios';

const VideoPlayer = ({ video, subjectId }) => {
  const router = useRouter();
  const { updateProgress } = useVideoStore();
  const [player, setPlayer] = useState(null);
  const [lastPosition, setLastPosition] = useState(0);
  const progressInterval = useRef(null);

  useEffect(() => {
    // Fetch initial progress when video loads
    const getInitialProgress = async () => {
      try {
        const { data } = await apiClient.get(`/progress/videos/${video.id}`);
        if (data && data.last_position_seconds > 0 && !data.is_completed) {
            setLastPosition(data.last_position_seconds);
        }
      } catch (err) {
        console.error('Error fetching progress', err);
      }
    };

    if (video?.id) {
       getInitialProgress();
    }
  }, [video?.id]);

  const extractYoutubeId = (url) => {
    if (!url) return null;
    
    // If it's already an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    try {
      // Handle various formats including shorts and standard
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^?&]{11})/);
      const id = match ? match[1] : null;
      
      if (id) {
        console.log('[VIDEO] Successfully extracted ID:', id);
        return id;
      } else {
        console.warn('[VIDEO] Could not extract ID from URL:', url);
        return null;
      }
    } catch (e) {
      console.error('[VIDEO] Error parsing URL:', url, e);
      return null;
    }
  };

  const videoId = extractYoutubeId(video?.youtube_url);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      start: lastPosition
    },
  };

  const onReady = (event) => {
    setPlayer(event.target);
    // if lastPosition is set, seek to it
    if (lastPosition > 0) {
        event.target.seekTo(lastPosition, true);
    }
  };

  const onStateChange = (event) => {
    // 1 is playing, 0 is ended, 2 is paused
    if (event.data === 1) {
      // Start tracking progress
      progressInterval.current = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        if (currentTime > 0) {
           updateProgress(video.id, currentTime, false);
        }
      }, 5000); // sync every 5 seconds
    } else {
      clearInterval(progressInterval.current);
      if (event.data === 0) {
        // Video finished
        updateProgress(video.id, event.target.getCurrentTime(), true).then(() => {
            const { nextVideoId } = useVideoStore.getState();
            if (nextVideoId) {
                router.push(`/subjects/${subjectId}/video/${nextVideoId}`);
            }
        });
      }
    }
  };

  useEffect(() => {
    return () => clearInterval(progressInterval.current);
  }, []);

  if (!videoId) return <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">Invalid Playback URL</div>;

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black relative">
       {/* React Youtube wrapper requires absolute positioning inside relative container to fill */}
       <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onReady} 
          onStateChange={onStateChange}
          className="absolute top-0 left-0 w-full h-full"
       />
    </div>
  );
};

export default VideoPlayer;
