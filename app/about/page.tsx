'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackEvent } from '@/lib/analytics';
import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    trackEvent('page_view', undefined, { page: 'about' });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/12780645/pexels-photo-12780645.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="NAMMA AURAA — Our Story"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/60 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 w-full">
            <p className="text-xs text-[#c9a84c] uppercase tracking-[0.3em] mb-3 font-medium">Our Story</p>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[0.9]">
              WE ARE<br />NAMMA AURAA
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-light">
            NAMMA AURAA was born from a simple idea — that the clothes we wear should say something about who we are and where we come from.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We grew up in the chaos of Indian streets — the auto stands and chai stalls, the filter coffee mornings and late-night dosa runs, the traffic jams that somehow became the best conversations of our lives. Everything we make is rooted in that world.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our oversized t-shirts are not just garments. They are inside jokes in Kannada, odes to Bengaluru traffic, love letters to home-cooked food, and celebrations of the beautifully messy experience of being young and Indian. Every design tells a story that you already know — because you lived it.
          </p>
          <div className="border-l-4 border-[#c9a84c] pl-6 py-2">
            <p className="text-xl lg:text-2xl font-light italic text-[#0a0a0a] leading-relaxed">
              &ldquo;We don&apos;t just make clothes. We make culture you can wear.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="py-16 lg:py-24 bg-[#f8f6f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">What We Stand For</p>
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">OUR VALUES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Premium Quality', desc: '240 GSM combed cotton. Built to last wash after wash. No corners cut, ever.' },
              { title: 'Rooted in Culture', desc: 'Every design is a nod to the Indian experience — the humour, the nostalgia, the pride.' },
              { title: 'Made in India', desc: 'Designed, printed, and shipped from India. For India, by India. Always.' },
            ].map((v) => (
              <div key={v.title} className="bg-white p-8 space-y-3 border border-gray-100">
                <div className="w-10 h-10 bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-[#c9a84c] font-black text-lg">✦</span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-[#0a0a0a]">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-6">
            READY TO WEAR THE CULTURE?
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300"
          >
            Shop T-Shirts <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
