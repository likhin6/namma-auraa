'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Insert profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
          phone: phone || null,
        });

        await trackEvent('registration', undefined, { method: 'email' });
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full" />
        </div>
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-white font-black uppercase tracking-[0.18em] text-2xl">NAMMA</span>
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <span className="text-white font-black uppercase tracking-[0.18em] text-2xl">AURAA</span>
          </div>
          <p className="text-gray-400 text-lg font-light italic">
            &ldquo;Join the culture.&rdquo;
          </p>
          <div className="w-16 h-px bg-[#c9a84c] mx-auto" />
          <div className="space-y-3 text-left max-w-xs">
            {[
              'Exclusive early access to new drops',
              'Members-only discounts',
              'Track your orders with ease',
              'Save your wishlist forever',
            ].map((benefit) => (
              <p key={benefit} className="text-gray-400 text-sm flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />
                {benefit}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            <span className="font-black uppercase tracking-[0.18em] text-xl">NAMMA</span>
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <span className="font-black uppercase tracking-[0.18em] text-xl">AURAA</span>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a]">Create Account</h1>
            <p className="text-gray-500 text-sm mt-2">Join the NAMMA AURAA culture</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Email Address</label>
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
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">
                Phone Number <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                  placeholder="Min. 6 characters"
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

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a0a0a] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0a0a0a] font-semibold hover:text-[#c9a84c] transition-colors">
              Sign in
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
