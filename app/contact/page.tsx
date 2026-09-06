'use client';

import { useState, useEffect } from 'react';
import { Mail, Instagram, Send, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    trackEvent('page_view', undefined, { page: 'contact' });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({ name, email, message });
      if (error) throw error;
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Get in touch</p>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">CONTACT US</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0a0a0a] mb-4">We&apos;d Love to Hear From You</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Questions about a product? Want to collaborate? Just want to say hi? Drop us a message and we&apos;ll get back to you within 48 hours.
              </p>
            </div>

            <div className="space-y-4">
              <a href="mailto:hello@nammaauraa.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-[#f8f6f2] flex items-center justify-center group-hover:bg-[#c9a84c] transition-colors">
                  <Mail size={20} className="text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Email</p>
                  <p className="text-sm font-medium text-[#0a0a0a]">hello@nammaauraa.com</p>
                </div>
              </a>

              <a href="https://instagram.com/namma.auraa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-[#f8f6f2] flex items-center justify-center group-hover:bg-[#c9a84c] transition-colors">
                  <Instagram size={20} className="text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Instagram</p>
                  <p className="text-sm font-medium text-[#0a0a0a]">@namma.auraa</p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f8f6f2] flex items-center justify-center">
                  <MapPin size={20} className="text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Based in</p>
                  <p className="text-sm font-medium text-[#0a0a0a]">Bengaluru, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 p-6 lg:p-8">
            {status === 'success' ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-50 flex items-center justify-center mx-auto rounded-full">
                  <Send size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Message Sent!</h3>
                <p className="text-gray-500 text-sm">We&apos;ll get back to you within 48 hours.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-xs uppercase tracking-widest text-[#c9a84c] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Send a Message</h2>

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
                    Something went wrong. Please try again.
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-medium text-gray-600">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#0a0a0a] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
