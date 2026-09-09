'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await trackEvent('login', undefined, { method: 'email' });
      router.push(redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full" />
        </div>
        <div className="relative z-10 text-center space-y-6">
          <Link href="/">
            <Logo variant="light" className="w-48" />
          </Link>
          <p className="text-gray-400 text-lg font-light italic">
            &ldquo;Made for the culture.&rdquo;
          </p>
          <div className="w-16 h-px bg-[#c9a84c] mx-auto" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Premium oversized t-shirts rooted in Indian culture, chaos, and everyday moments.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link href="/">
              <Logo className="w-32" />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a]">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest font-medium text-gray-600">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#c9a84c] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a0a0a] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#0a0a0a] font-semibold hover:text-[#c9a84c] transition-colors">
              Create one
            </Link>
          </p>

          <div className="text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
