'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, Clock, PlayCircle, ChevronRight, Moon, Sun, MonitorPlay } from 'lucide-react';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

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
    fetchSubjects();
  }, [user, router]);

  // Dynamic Theme Values for Neumorphism
  const theme = {
    bg: isDark ? 'bg-[#2d3748]' : 'bg-[#e0e5ec]',
    text: isDark ? 'text-gray-200' : 'text-[#4a5568]',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textHero: isDark ? 'text-white' : 'text-gray-800',
    shadowOuter: isDark 
      ? 'shadow-[6px_6px_12px_#1a202c,-6px_-6px_12px_#4a5568]' 
      : 'shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]',
    shadowInner: isDark 
      ? 'shadow-[inset_4px_4px_8px_#1a202c,inset_-4px_-4px_8px_#4a5568]' 
      : 'shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]',
    hoverOuter: isDark
      ? 'hover:shadow-[inset_4px_4px_8px_#1a202c,inset_-4px_-4px_8px_#4a5568]'
      : 'hover:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]',
    activeShadow: isDark
      ? 'active:shadow-[inset_6px_6px_10px_#1a202c,inset_-6px_-6px_10px_#4a5568]'
      : 'active:shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff]',
    borderDim: isDark ? 'border-gray-700/50' : 'border-white/40',
  };

  if (!user || loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center font-sans transition-colors duration-500`}>
        <div className={`w-12 h-12 rounded-full border-4 ${isDark ? 'border-[#4a5568]' : 'border-[#a3b1c6]'} border-t-blue-500 animate-spin ${theme.shadowOuter}`}></div>
      </div>
    );
  }



  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col font-sans transition-colors duration-500 selection:bg-blue-400/30`}>
      
      {/* Header */}
      <header className={`px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50 ${theme.bg}/90 backdrop-blur-md border-b ${theme.borderDim} transition-colors duration-500`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
             <div className={`w-8 h-8 rounded-lg ${theme.shadowInner} ${theme.bg} flex items-center justify-center`}>
                <MonitorPlay className="w-4 h-4 text-blue-500" />
             </div>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
               NexusLearn
             </span>
          </Link>
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.shadowInner} ${theme.bg}`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          
          <button 
            onClick={toggleTheme}
            title="Toggle theme"
            className={`p-2.5 rounded-xl ${theme.shadowOuter} ${theme.hoverOuter} ${theme.bg} ${theme.textMuted} transition-all`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          <div className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${theme.shadowOuter} ${theme.bg}`}>
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
          <div className={`p-8 rounded-2xl ${theme.shadowOuter} ${theme.bg} relative overflow-hidden flex flex-col justify-center`}>
            <div className="relative z-10">
              <h1 className={`text-3xl font-extrabold ${theme.textHero} tracking-tight mb-3`}>
                Welcome back, <span className="text-blue-500">{user.name || 'Student'}</span>
              </h1>
              <p className={`${theme.textMuted} text-base font-medium max-w-lg mb-6 leading-relaxed`}>
                Ready to continue your learning journey? Explore the library below and dive into any course you'd like.
              </p>
              
              <div className="flex items-center gap-4">
                <Link href="/profile" className={`px-5 py-2.5 rounded-lg border border-transparent ${theme.shadowOuter} ${theme.activeShadow} ${theme.bg} ${theme.textMuted} font-bold text-sm flex items-center gap-2 transition-all`}>
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Available Subjects Library */}
        <section>
          <div className="mb-6">
             <h2 className={`text-2xl font-extrabold ${theme.textHero}`}>Library</h2>
             <p className={`mt-1 text-sm font-medium ${theme.textMuted}`}>Explore all available subjects.</p>
          </div>

          {subjects.length === 0 && !loading && (
            <div className={`rounded-2xl ${theme.shadowInner} ${theme.bg} p-8 text-center`}>
              <p className={`text-sm font-bold ${theme.textMuted}`}>No subjects published yet.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, idx) => {
              // Structured coloring logic instead of random pop colors
              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`}>
                  <div className={`p-6 rounded-2xl ${theme.shadowOuter} hover:scale-[1.02] ${theme.bg} transition-all duration-300 h-full flex flex-col group`}>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${theme.shadowInner} ${theme.bg} flex items-center justify-center font-bold text-xl text-indigo-500`}>
                        {subject.title.charAt(0)}
                      </div>
                      <h3 className={`text-lg font-bold ${theme.textHero} leading-snug group-hover:text-blue-500 transition-colors line-clamp-2`}>
                        {subject.title}
                      </h3>
                    </div>
                    
                    <p className={`text-sm ${theme.textMuted} font-medium line-clamp-3 mb-6 flex-1`}>
                      {subject.description}
                    </p>
                    
                    <div className={`mt-auto w-full py-2.5 px-4 rounded-lg border border-transparent ${theme.shadowOuter} ${theme.bg} group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all text-center`}>
                      <span className={`text-sm font-bold ${theme.text} group-hover:text-blue-500 flex items-center justify-center gap-1.5`}>
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
