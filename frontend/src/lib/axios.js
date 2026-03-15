import jsCookie from 'js-cookie';
import { mockDb } from './mockData';

// Polyfill delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getStorage = (key, defaultVal) => {
  if (typeof window === 'undefined') return defaultVal;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const setStorage = (key, val) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
};

export const apiClient = {
  get: async (url) => {
    await delay(200);
    const token = jsCookie.get('accessToken');
    if (!token && !url.includes('/auth/')) {
       return Promise.reject({ response: { status: 401 } });
    }

    if (url === '/subjects') {
      return { data: mockDb.subjects };
    }

    if (url.startsWith('/subjects/')) {
      const parts = url.split('/');
      const subjectId = parseInt(parts[2]);
      
      const subject = mockDb.subjects.find(s => s.id === subjectId);
      if (!subject) return Promise.reject({ response: { data: { message: 'Not found' } }});

      if (parts[3] === 'tree') {
        const sections = mockDb.sections.filter(s => s.subject_id === subjectId);
        const progressList = getStorage('video_progress', []);
        const currentUser = getStorage('currentUser', { id: 1 });
        
        let prevCompleted = true;
        const sectionsWithVideos = sections.map(sec => {
           let orderedVideos = mockDb.videos.filter(v => v.section_id === sec.id).sort((a,b) => a.order_index - b.order_index);
           const vids = orderedVideos.map((vid, index) => {
              const p = progressList.find(pr => pr.video_id === vid.id && pr.user_id === currentUser.id);
              const isCompleted = p ? p.is_completed : false;
              const isLocked = !prevCompleted;
              prevCompleted = isCompleted;
              return { ...vid, is_completed: isCompleted, locked: isLocked };
           });
           return { ...sec, videos: vids };
        });

        // First video of first section unconditionally unlocked
        if (sectionsWithVideos.length > 0 && sectionsWithVideos[0].videos.length > 0) {
           sectionsWithVideos[0].videos[0].locked = false;
        }

        return { data: { sections: sectionsWithVideos } };
      }

      // /subjects/:id
      return { data: subject };
    }

    if (url.startsWith('/videos/')) {
       const videoId = parseInt(url.split('/')[2]);
       const video = mockDb.videos.find(v => v.id === videoId);
       if (!video) return Promise.reject({ response: { data: { message: 'Not found' } }});
       
       const section = mockDb.sections.find(s => s.id === video.section_id);
       const allSections = mockDb.sections.filter(s => s.subject_id === section.subject_id);
       const sectionIds = allSections.map(s => s.id);
       
       let orderedVideos = [];
       allSections.forEach(sec => {
          let secVideos = mockDb.videos.filter(v => v.section_id === sec.id).sort((a,b) => a.order_index - b.order_index);
          orderedVideos.push(...secVideos);
       });

       const currentIndex = orderedVideos.findIndex(v => v.id === videoId);
       
       const progressList = getStorage('video_progress', []);
       const currentUser = getStorage('currentUser', { id: 1 });
       
       let computedLocked = false;
       let isLocked = false;
       let prevCompleted = true;

       for (let i = 0; i <= currentIndex; i++) {
           const vid = orderedVideos[i];
           const p = progressList.find(pr => pr.video_id === vid.id && pr.user_id === currentUser.id);
           const completed = p ? Boolean(p.is_completed) : false;
           if (i > 0) {
               computedLocked = !prevCompleted;
           } else {
               computedLocked = false;
           }
           if (i === currentIndex) {
               isLocked = computedLocked;
           }
           prevCompleted = completed;
       }

       const previous_video_id = currentIndex > 0 ? orderedVideos[currentIndex - 1].id : null;
       const next_video_id = currentIndex < orderedVideos.length - 1 ? orderedVideos[currentIndex + 1].id : null;

       return {
         data: {
           video: video,
           previous_video_id,
           next_video_id,
           locked: isLocked
         }
       };
    }

    if (url.startsWith('/progress/videos/')) {
      const videoId = parseInt(url.split('/')[3]);
      const currentUser = getStorage('currentUser', { id: 1 });
      const progressList = getStorage('video_progress', []);
      const match = progressList.find(p => p.video_id === videoId && p.user_id === currentUser.id);
      return { data: match || { last_position_seconds: 0, is_completed: false } };
    }

    return Promise.reject({ response: { status: 404 } });
  },
  
  post: async (url, data) => {
    await delay(300);
    
    if (url === '/auth/login') {
      const users = getStorage('users', []);
      const user = users.find(u => u.email === data.email && u.password === data.password);
      if (user) {
        const payload = btoa(JSON.stringify({ id: user.id }));
        const mockToken = `header.${payload}.signature`;
        jsCookie.set('accessToken', mockToken, { expires: 1 });
        setStorage('currentUser', user);
        return { data: { user, accessToken: mockToken } };
      }
      return Promise.reject({ response: { data: { message: 'Invalid credentials' } } });
    }

    if (url === '/auth/register') {
      const users = getStorage('users', []);
      if (users.find(u => u.email === data.email)) {
        return Promise.reject({ response: { data: { message: 'User exists' } } });
      }
      users.push({ id: Date.now(), ...data });
      setStorage('users', users);
      return { data: { message: 'Registered successfully' } };
    }

    if (url.startsWith('/progress/videos/')) {
      const videoId = parseInt(url.split('/')[3]);
      const currentUser = getStorage('currentUser', { id: 1 });
      const progressList = getStorage('video_progress', []);
      
      const index = progressList.findIndex(p => p.video_id === videoId && p.user_id === currentUser.id);
      if (index >= 0) {
        progressList[index].last_position_seconds = data.last_position_seconds !== undefined ? data.last_position_seconds : progressList[index].last_position_seconds;
        progressList[index].is_completed = progressList[index].is_completed || data.is_completed;
      } else {
        progressList.push({
          user_id: currentUser.id,
          video_id: videoId,
          last_position_seconds: data.last_position_seconds || 0,
          is_completed: data.is_completed || false,
        });
      }
      setStorage('video_progress', progressList);
      return { data: { message: 'Progress updated' } };
    }

    return Promise.reject({ response: { status: 404 } });
  }
};
