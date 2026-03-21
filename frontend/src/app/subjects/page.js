'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, Clock, PlayCircle, ChevronRight, Moon, Sun, MonitorPlay, CheckCircle } from 'lucide-react';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [isDark, setIsDark] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingMap, setEnrollingMap] = useState({});

  useEffect(() => {
    // Check local storage for theme preference purely as an initial check
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await apiClient.get('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSubjects();
  }, [user, router]);

  const enrollInSubject = async (e, subjectId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEnrollingMap(prev => ({ ...prev, [subjectId]: true }));
    
    try {
      await apiClient.post(`/subjects/${Number(subjectId)}/enroll`);
      // Update local state
      setSubjects(prev => prev.map(s => Number(s.id) === Number(subjectId) ? { ...s, isEnrolled: true } : s));
      // Directly navigate to course
      router.push(`/subjects/${subjectId}`);
    } catch (err) {
      console.error('Enrollment failed', err);
      // Revert if failed
      await fetchSubjects();
      setEnrollingMap(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  // Extract categories
  const categories = ['All', ...new Set(subjects.map(s => s.category || 'General'))];
  
  const filteredSubjects = subjects.filter(s => {
    const matchesCategory = selectedCategory === 'All' || (s.category || 'General') === selectedCategory;
    const matchesSearch = (s.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                         (s.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic Theme Values for Glassmorphism
  const theme = {
    bg: isDark ? 'bg-gray-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl',
    text: isDark ? 'text-gray-200' : 'text-[#2d3748]',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textHero: isDark ? 'text-white' : 'text-gray-900',
    shadowOuter: isDark 
      ? 'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]' 
      : 'shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]',
    shadowInner: isDark 
      ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]' 
      : 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
    hoverOuter: 'hover:shadow-2xl transition-all duration-300',
    activeShadow: 'active:scale-95 transition-all duration-300',
    borderDim: isDark ? 'border-white/10' : 'border-white/40',
    glassBorder: isDark ? 'border-gray-500/20' : 'border-white/60',
  };

  if (!user || loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center font-sans transition-colors duration-500`}>
        <div className={`w-12 h-12 rounded-full border-4 ${isDark ? 'border-[#4a5568]' : 'border-[#a3b1c6]'} border-t-blue-500 animate-spin ${theme.shadowOuter}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col font-sans transition-colors duration-500 selection:bg-blue-400/30 relative z-0`}>
      
      {/* Full Page Classroom Wallpaper */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
         <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-luminosity" alt="Classroom Background" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-[#1a202c]"></div>
      </div>
      
      {/* Header */}
      <header className={`px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50 ${theme.bg} border-b ${theme.borderDim} transition-colors duration-500`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
             <div className={`w-10 h-10 rounded-xl ${theme.shadowInner} ${theme.bg} border ${theme.glassBorder} flex items-center justify-center`}>
                <MonitorPlay className="w-5 h-5 text-blue-500" />
             </div>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
                NexusLearn
             </span>
          </Link>
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.bg} border ${theme.glassBorder} ${theme.shadowInner}`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Live Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          
          <button 
            onClick={toggleTheme}
            title="Toggle theme"
            className={`p-2.5 rounded-xl ${theme.bg} border ${theme.glassBorder} ${theme.shadowOuter} ${theme.textMuted} transition-all active:scale-95`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          <div className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${theme.bg} border ${theme.glassBorder} ${theme.shadowInner}`}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex justify-center items-center font-bold text-xs shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <span className={`font-semibold text-sm ${theme.text}`}>{user.name || user.email?.split('@')[0]}</span>
          </div>
          
          <button 
            onClick={logout} 
            title="Logout"
            className={`p-2.5 rounded-xl flex items-center justify-center gap-2 text-red-500 ${theme.shadowOuter} ${theme.hoverOuter} ${theme.activeShadow} ${theme.bg} transition-all`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-10">
        
        {/* Welcome Block */}
        <section>
          <div className={`p-8 md:p-12 rounded-[50px] ${theme.bg} border ${theme.glassBorder} ${theme.shadowOuter} relative overflow-hidden flex flex-col justify-center`}>
            {/* Decorative background elements */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse`}></div>
            <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl animate-pulse`}></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h1 className={`text-5xl font-black ${theme.textHero} tracking-tighter mb-4 leading-tight`}>
                  Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">skills</span> today, <br/>
                  {user.name || 'Student'}.
                </h1>
                <p className={`${theme.textMuted} text-lg font-bold mb-10 leading-relaxed max-w-lg`}>
                  Unlock your potential with our expert-led courses. Track your progress and master new technologies at your own pace.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className={`flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl ${theme.bg} border ${theme.glassBorder} shadow-2xl`}>
                    <svg className={`w-5 h-5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search for premium courses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`bg-transparent border-none outline-none w-full text-sm font-black ${theme.text} placeholder:${theme.textMuted}/50`}
                    />
                  </div>
                </div>
              </div>

              <div className={`hidden lg:flex w-64 h-64 rounded-[40px] ${theme.bg} border ${theme.glassBorder} ${theme.shadowOuter} p-2 overflow-hidden shrink-0`}>
                 <img 
                    src="/welcome-illustration.png" 
                    alt="Learning Hub" 
                    className="w-full h-full object-cover rounded-[32px] transition-transform duration-700 hover:scale-110" 
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Available Subjects Library */}
        <section className="relative mt-10">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-10 px-4">
             <div>
                <h2 className={`text-3xl font-black ${theme.textHero} tracking-tighter`}>Featured Premium Courses</h2>
                <p className={`mt-1 text-sm font-bold ${theme.textMuted}`}>Showing {filteredSubjects.length} courses</p>
             </div>

             <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? `bg-blue-600 text-white shadow-xl scale-105` 
                        : `${theme.bg} border ${theme.glassBorder} ${theme.textMuted} hover:text-blue-500 shadow-md`
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {filteredSubjects.length === 0 && (
            <div className={`relative z-10 rounded-3xl ${theme.shadowInner} ${theme.bg} p-20 text-center`}>
              <div className="flex justify-center mb-6">
                 <div className={`w-20 h-20 rounded-full ${theme.shadowOuter} ${theme.bg} flex items-center justify-center`}>
                   <BookOpen className={`w-10 h-10 ${theme.textMuted}`} />
                 </div>
              </div>
              <h3 className={`text-xl font-black ${theme.textHero} mb-2`}>No courses found</h3>
              <p className={`text-sm font-bold ${theme.textMuted}`}>Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                className="mt-6 text-[#6366f1] font-black text-sm uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 px-2">
            {filteredSubjects.map((subject) => {
              const isEnrolled = subject.isEnrolled;
              
              const CardContent = (
                <div className={`rounded-2xl ${theme.shadowOuter} flex flex-col h-full overflow-hidden border border-transparent transition-all duration-300 relative group active:scale-[0.98]`}>
                  
                  {/* Premium Thumbnail Section */}
                  <div className="relative w-full aspect-video bg-gray-800 border-b-4 border-blue-500">
                    <img 
                      src={subject.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'} 
                      alt={subject.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    
                    {isEnrolled && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500 text-white shadow-lg border border-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase">Enrolled</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Content Area */}
                  <div className={`p-6 flex flex-col flex-1 ${theme.bg}`}>
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-1.5 bg-[#6366f1] text-white text-[10px] uppercase tracking-widest font-black rounded-lg shadow-sm`}>
                        {subject.category || 'General'}
                      </span>
                    </div>

                    <h3 className={`text-lg font-black ${theme.textHero} leading-snug line-clamp-1 mb-2`}>
                      {subject.title}
                    </h3>
                    
                    <p className={`text-xs ${theme.textMuted} font-bold line-clamp-2 mb-6 flex-1`}>
                      {subject.description}
                    </p>
                    
                    {isEnrolled && (
                      <div className="mb-5 space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                            <span className={theme.textMuted}>Progress</span>
                            <span className="text-[#6366f1]">{subject.progress}%</span>
                         </div>
                         <div className={`h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-[#6366f1] transition-all duration-1000"
                              style={{ width: `${subject.progress}%` }}
                            ></div>
                         </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      {isEnrolled ? (
                        <div className={`w-full py-3 px-4 rounded-xl border border-transparent ${theme.shadowOuter} ${theme.bg} group-hover:shadow-inner transition-all text-center`}>
                           <span className={`text-sm font-black ${theme.text} group-hover:text-blue-500 flex items-center justify-center gap-2 uppercase tracking-wide`}>
                             Continue <PlayCircle className="w-4 h-4 ml-1" />
                           </span>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => enrollInSubject(e, subject.id)}
                          disabled={enrollingMap[subject.id]}
                          className={`w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                            enrollingMap[subject.id]
                              ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                              : 'bg-gradient-to-r from-blue-600 to-[#6366f1] text-white shadow-lg hover:shadow-xl active:scale-95'
                          }`}
                        >
                          {enrollingMap[subject.id] ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={subject.id} onClick={() => router.push(`/subjects/${subject.id}`)} className="cursor-pointer">
                  {CardContent}
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
