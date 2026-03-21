'use client';

import React, { useEffect, useRef, useState } from 'react';
import useVideoStore from '../store/videoStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/axios';

const VideoPlayer = ({ video, subjectId }) => {
  const router = useRouter();
  const { updateProgress } = useVideoStore();
  const [lastPosition, setLastPosition] = useState(0);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const progressInterval = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  // 1. Extract Youtube ID
  const extractYoutubeId = (url) => {
    if (!url) return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^?&]{11})/);
    return match ? match[1] : null;
  };
  const videoId = extractYoutubeId(video?.youtube_url);

  // 2. Fetch Progress
  useEffect(() => {
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
    if (video?.id) getInitialProgress();
  }, [video?.id]);

  // 3. Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Global callback for YT API
    window.onYouTubeIframeAPIReady = () => setIsApiReady(true);
  }, []);

  // 4. Initialize Player
  useEffect(() => {
    if (isApiReady && videoId && containerRef.current) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      
      containerRef.current.innerHTML = '<div id="youtube-player"></div>';
      
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          start: lastPosition
        },
        events: {
          onReady: (event) => {
             playerRef.current = event.target;
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (progressInterval.current) clearInterval(progressInterval.current);
              progressInterval.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  const currentTime = playerRef.current.getCurrentTime();
                  if (currentTime > 0) {
                    updateProgress(video.id, currentTime, false);
                  }
                }
              }, 5000);
            } else {
              clearInterval(progressInterval.current);
              if (event.data === window.YT.PlayerState.ENDED) {
                updateProgress(video.id, playerRef.current.getCurrentTime(), true).then(() => {
                  const { nextVideoId } = useVideoStore.getState();
                  if (nextVideoId) {
                    router.push(`/subjects/${subjectId}/video/${nextVideoId}`);
                  }
                });
              }
            }
          },
          onError: (event) => {
            if (event.data === 150 || event.data === 101) {
              setPlayerError({
                message: 'This video cannot be embedded (owner disabled playback on other sites).',
                fallbackUrl: `https://www.youtube.com/watch?v=${videoId}`
              });
            } else {
              setPlayerError({
                message: 'An unexpected error occurred while loading the video.',
                fallbackUrl: `https://www.youtube.com/watch?v=${videoId}`
              });
            }
          }
        }
      });
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isApiReady, videoId, subjectId, video.id, router, updateProgress, lastPosition]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold p-10 text-center">
        Invalid Video URL
      </div>
    );
  }

  if (playerError) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white p-8 text-center gap-4">
        <p className="font-medium">{playerError.message}</p>
        <a
          href={playerError.fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Watch on YouTube
        </a>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-black/10 relative">
      <div className="w-full aspect-video relative" ref={containerRef}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm italic">
          Initializing Player...
        </div>
      </div>
      <style jsx global>{`
        #youtube-player {
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
