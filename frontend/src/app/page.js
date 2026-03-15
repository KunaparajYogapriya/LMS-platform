'use client';

import Link from 'next/link';
import { ShoppingCart, Sparkles, ArrowDown } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white text-black px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tighter">NexusLearn</Link>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#111111] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            AI Assistant
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-700 hover:text-black transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className="bg-[#111111] text-white px-4 py-2 rounded-full">Home</Link>
            {!user ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-black border border-gray-300 px-4 py-2 rounded-lg transition-colors">Log in</Link>
                <Link href="/register" className="bg-[#111111] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Sign up</Link>
              </>
            ) : (
              <Link href="/subjects" className="bg-[#111111] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Go to Dashboard</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col items-start gap-8">
            <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <span className="text-orange-400">⚡</span> Learn at your own pace
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              Skills for your present and your future.
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
              World-class courses taught by expert instructors. Start learning today and unlock your potential.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
              <Link 
                href="/subjects" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-transform hover:-translate-y-0.5"
              >
                Browse courses <ArrowDown className="w-4 h-4 ml-1" />
              </Link>
              {!user && (
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto flex items-center justify-center text-sm font-bold px-8 py-4 rounded-lg border border-gray-600 hover:border-gray-400 hover:bg-gray-800 transition-all text-white"
                >
                  Sign up free
                </Link>
              )}
            </div>
          </div>

          {/* Right Column (Stats Grid) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors group cursor-default">
               <span className="text-4xl sm:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">5+</span>
               <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Expert Courses</span>
             </div>

             <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors group cursor-default">
               <span className="text-4xl sm:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">500K+</span>
               <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Students Enrolled</span>
             </div>

             <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors group cursor-default">
               <span className="text-4xl sm:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">4.7★</span>
               <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Average Rating</span>
             </div>

             <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors group cursor-default">
               <span className="text-4xl sm:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">100%</span>
               <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Free to try</span>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
