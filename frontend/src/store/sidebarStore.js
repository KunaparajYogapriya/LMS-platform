import { create } from 'zustand';
import { apiClient } from '../lib/axios';

const useSidebarStore = create((set) => ({
  subjectTree: [],
  subject: null,
  isLoading: false,
  error: null,

  fetchTree: async (subjectId) => {
    // Clear old state immediately to prevent race conditions during navigation
    set({ isLoading: true, error: null, subjectTree: [], subject: null });
    try {
      // Fetch both for performance, if first fails, catch block handles it
      const [treeRes, subjectRes] = await Promise.all([
        apiClient.get(`/subjects/${subjectId}/tree`),
        apiClient.get(`/subjects/${subjectId}`)
      ]);
      
      set({ 
        subjectTree: treeRes.data.sections, 
        subject: subjectRes.data,
        isLoading: false 
      });
    } catch (err) {
      const isNotEnrolled = err.response?.status === 403;
      
      // If tree failed, try to at least get subject headers
      let subjectData = null;
      try {
        const res = await apiClient.get(`/subjects/${subjectId}`);
        subjectData = res.data;
      } catch (e) {}

      set({ 
        error: isNotEnrolled ? 'Not Enrolled' : 'Error loading curriculum', 
        subject: subjectData,
        isLoading: false 
      });
    }
  },

  refreshProgress: async (subjectId) => {
    try {
      const { data: treeData } = await apiClient.get(`/subjects/${subjectId}/tree`);
      set({ subjectTree: treeData.sections });
    } catch (err) {
      console.error('Failed to refresh progress', err);
    }
  }
}));

export default useSidebarStore;
