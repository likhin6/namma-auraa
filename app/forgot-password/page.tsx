'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-black uppercase tracking-[0.18em] text-xl">NAMMA</span>
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <span className="font-black uppercase tracking-[0.18em] text-xl">AURAA</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a]">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-2">We&apos;ll send you a reset link</p>
        </div>

        {sent ? (
          <div className="bg-white border border-gray-100 p-8 text-center space-y-4">
            <Mail size={32} className="text-[#c9a84c] mx-auto" />
            <p className="text-sm text-gray-600">Check your email for a password reset link.</p>
            <Link href="/login" className="text-xs uppercase tracking-widest text-[#0a0a0a] underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a0a0a] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
