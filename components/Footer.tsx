'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Instagram, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() });
      if (error && error.code !== '23505') throw error;
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-1">
              <span className="font-black uppercase tracking-[0.18em] text-white text-lg">NAMMA</span>
              <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
              <span className="font-black uppercase tracking-[0.18em] text-white text-lg">AURAA</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Premium oversized t-shirts rooted in Indian culture, chaos, and everyday moments. Worn by those who own their identity.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/namma.auraa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#c9a84c] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:hello@nammaauraa.com"
                className="text-gray-400 hover:text-[#c9a84c] transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Join the culture</p>
              {status === 'success' ? (
                <p className="text-[#c9a84c] text-sm">You&apos;re in. Welcome to NAMMA AURAA.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="flex-1 bg-transparent border-b border-gray-700 text-white placeholder:text-gray-600 text-sm py-2 px-0 outline-none focus:border-[#c9a84c] transition-colors min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="ml-3 text-[#c9a84c] hover:text-white transition-colors disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-xs mt-2">Something went wrong. Try again.</p>
              )}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Shop */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Shop</h4>
              <ul className="space-y-3">
                {[
                  { href: '/shop', label: 'All T-Shirts' },
                  { href: '/shop?filter=new', label: 'New Arrivals' },
                  { href: '/shop?filter=featured', label: 'Featured Drops' },
                  { href: '/shop?filter=bestseller', label: 'Bestsellers' },
                  { href: '/shop?filter=collections', label: 'Collections' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Help</h4>
              <ul className="space-y-3">
                {[
                  { href: '/contact', label: 'Contact Us' },
                  { href: '/contact#faq', label: 'FAQ' },
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms & Conditions' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brand */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Brand</h4>
              <ul className="space-y-3">
                {[
                  { href: '/about', label: 'About Us' },
                  { href: '/about#story', label: 'Our Story' },
                  { href: '/about#values', label: 'Our Values' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} NAMMA AURAA. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
