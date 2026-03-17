'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      router.push('/subjects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-[#4a5568] tracking-wider drop-shadow-sm">
          Welcome Back
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-10 px-6 sm:px-10 bg-[#e0e5ec] rounded-3xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] text-red-500 p-4 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#4a5568] mb-2 px-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#e0e5ec] rounded-xl shadow-[inset_6px_6px_10px_0_#a3b1c6,inset_-6px_-6px_10px_0_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#a3b1c6] px-5 py-3 text-[#4a5568] placeholder-gray-400 font-medium transition-shadow"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4a5568] mb-2 px-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#e0e5ec] rounded-xl shadow-[inset_6px_6px_10px_0_#a3b1c6,inset_-6px_-6px_10px_0_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#a3b1c6] px-5 py-3 text-[#4a5568] placeholder-gray-400 font-medium transition-shadow"
                placeholder="Enter your password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-[6px_6px_10px_0_#a3b1c6,-6px_-6px_10px_0_#ffffff] hover:shadow-[inset_6px_6px_10px_0_#a3b1c6,inset_-6px_-6px_10px_0_#ffffff] active:shadow-[inset_8px_8px_14px_0_#a3b1c6,inset_-8px_-8px_14px_0_#ffffff] focus:outline-none transition-all duration-300 text-lg font-bold text-[#4a5568] disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="text-sm text-center mt-6">
              <Link href="/register" className="font-semibold text-[#4a5568] hover:text-[#2d3748] transition-colors">
                Don&apos;t have an account? <span className="underline decoration-[#a3b1c6] underline-offset-4">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
