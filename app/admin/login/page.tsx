'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Check admin status
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!adminCheck) {
        await supabase.auth.signOut();
        throw new Error('You do not have admin access.');
      }

      await trackEvent('login', undefined, { method: 'admin' });
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-black uppercase tracking-[0.18em] text-white text-xl">NAMMA</span>
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <span className="font-black uppercase tracking-[0.18em] text-white text-xl">AURAA</span>
          </div>
          <div className="inline-block border border-[#c9a84c] px-3 py-1 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-medium">Admin Access</p>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest font-medium text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-700 px-4 py-3 text-sm outline-none focus:border-[#c9a84c] transition-colors text-white placeholder:text-gray-600"
              placeholder="admin@nammaauraa.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest font-medium text-gray-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-700 px-4 py-3 pr-12 text-sm outline-none focus:border-[#c9a84c] transition-colors text-white placeholder:text-gray-600"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] text-[#0a0a0a] py-4 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
