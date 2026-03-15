import { create } from 'zustand';
import { apiClient } from '../lib/axios';

const useSidebarStore = create((set) => ({
  subjectTree: [],
  subject: null,
  isLoading: false,
  error: null,

  fetchTree: async (subjectId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: treeData } = await apiClient.get(`/subjects/${subjectId}/tree`);
      const { data: subjectData } = await apiClient.get(`/subjects/${subjectId}`);
      set({ 
        subjectTree: treeData.sections, 
        subject: subjectData,
        isLoading: false 
      });
    } catch (err) {
      set({ error: 'Error loading curriculum', isLoading: false });
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
