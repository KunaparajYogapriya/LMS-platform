import { create } from 'zustand';
import { apiClient } from '../lib/axios';

const useVideoStore = create((set, get) => ({
  currentVideo: null,
  previousVideoId: null,
  nextVideoId: null,
  locked: true,
  currentTime: 0,
  isLoading: false,
  error: null,

  fetchVideo: async (videoId) => {
    set({ isLoading: true, error: null, currentVideo: null, previousVideoId: null, nextVideoId: null });
    try {
      const { data } = await apiClient.get(`/videos/${videoId}`);
      set({
        currentVideo: data.video,
        previousVideoId: data.previous_video_id,
        nextVideoId: data.next_video_id,
        locked: data.locked,
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error loading video', isLoading: false });
      return null;
    }
  },

  updateProgress: async (videoId, lastPosition, isCompleted) => {
    try {
      await apiClient.post(`/progress/videos/${videoId}`, {
        last_position_seconds: Math.floor(lastPosition),
        is_completed: isCompleted,
      });
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  },

  setCurrentTime: (time) => set({ currentTime: time }),
}));

export default useVideoStore;
