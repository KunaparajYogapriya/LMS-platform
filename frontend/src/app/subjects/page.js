'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!user || loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white text-black px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tighter">NexusLearn</Link>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#111111] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
             <span className="text-orange-400">⚡</span> Student Dashboard
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/profile" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">Profile</Link>
          <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
           <h2 className="text-3xl font-extrabold text-gray-900">Available Subjects</h2>
           <p className="mt-2 text-gray-600">Choose a subject to continue learning</p>
        </div>

        {subjects.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            No subjects published yet.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                  {subject.title.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{subject.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">{subject.description}</p>
                <div className="mt-auto flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Start Learning →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
