'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  badge: string | null;
  new_arrival: boolean;
  bestseller: boolean;
  trending: boolean;
  featured: boolean;
  product_images: { image_url: string }[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    trackEvent('page_view', undefined, { page: 'home' });
    fetchData();
  }, []);

  async function fetchData() {
    const [featuredRes, newRes, collectionsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, price, mrp, badge, new_arrival, bestseller, trending, featured, product_images(image_url)')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('products')
        .select('id, name, slug, price, mrp, badge, new_arrival, bestseller, trending, featured, product_images(image_url)')
        .eq('published', true)
        .eq('new_arrival', true)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('collections')
        .select('id, name, slug, description, image_url')
        .eq('published', true)
        .order('display_order', { ascending: true })
        .limit(6),
    ]);

    setFeaturedProducts((featuredRes.data as unknown as Product[]) ?? []);
    setNewArrivals((newRes.data as unknown as Product[]) ?? []);
    setCollections(collectionsRes.data ?? []);
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: newsletterEmail.trim().toLowerCase() });
      if (error && error.code !== '23505') throw error;
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── HERO ── */}
      <section className="overflow-hidden bg-[#f8f6f2]">
        <h1 className="sr-only">NAMMA AURAA — More Than AURAA</h1>

        {/* Real, crisp headline for mobile — the campaign image's own baked-in
            headline text lives in a panel that gets cropped out below, and
            raster text blurs/gets cut off when scaled, so we render it live instead. */}
        <div className="px-5 pt-8 pb-6 md:hidden">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.3em] text-[#c9a84c]">
            Premium Indian Streetwear
          </p>
          <p className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-[#0a0a0a]">
            MADE <span className="text-[#c9a84c]">FOR THE</span> CULTURE.
          </p>
        </div>

        <div className="relative">
          <img
            src="/home.png?v=3"
            alt="NAMMA AURAA streetwear campaign featuring three models"
            className="aspect-[7/6] w-full object-cover object-right md:aspect-auto md:h-auto md:object-contain"
          />

          {/* Contrast layer so the CTA buttons stay legible over the busy photo on mobile. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent md:hidden" />

          {/* Crisp HTML buttons that sit exactly over the campaign image's
              (blurry, baked-in) CTA artwork, so the visible text is always sharp. */}
          <Link
            href="/shop"
            aria-label="Shop NAMMA AURAA t-shirts"
            className="group absolute left-[5.5%] top-[67%] z-10 hidden h-[6%] w-[12.5%] items-center justify-center gap-2 bg-[#0a0a0a] text-[clamp(0.55rem,1.05vw,0.9rem)] font-semibold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:flex"
          >
            Shop T-Shirts
            <ArrowRight size={14} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/about"
            aria-label="Read the NAMMA AURAA story"
            className="absolute left-[18.5%] top-[67%] z-10 hidden h-[6%] w-[10.5%] items-center justify-center border border-[#0a0a0a] bg-white text-[clamp(0.55rem,1.05vw,0.9rem)] font-semibold uppercase tracking-widest text-[#0a0a0a] transition-colors duration-300 hover:bg-[#0a0a0a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a0a0a] md:flex"
          >
            Our Story
          </Link>

          <div className="absolute inset-x-5 bottom-6 z-20 flex gap-3 md:hidden">
            <Link
              href="/shop"
              className="group flex flex-1 items-center justify-center gap-2 bg-[#0a0a0a] px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-[#c9a84c] hover:text-[#0a0a0a]"
            >
              Shop T-Shirts
              <ArrowRight size={14} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="flex flex-1 items-center justify-center border border-white/70 bg-white/95 px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#0a0a0a] transition-colors duration-300 hover:bg-[#0a0a0a] hover:text-white"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED DROPS ── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Handpicked</p>
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                FEATURED DROPS
              </h2>
            </div>
            <Link
              href="/shop?filter=featured"
              className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-widest text-[#0a0a0a] hover:text-[#c9a84c] transition-colors font-medium"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/shop?filter=featured"
              className="text-xs uppercase tracking-widest border border-[#0a0a0a] px-8 py-3 hover:bg-[#0a0a0a] hover:text-white transition-colors inline-block"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-16 lg:py-24 bg-[#f8f6f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Just Dropped</p>
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                NEW ARRIVALS
              </h2>
            </div>
            <Link
              href="/shop?filter=new"
              className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-widest text-[#0a0a0a] hover:text-[#c9a84c] transition-colors font-medium"
            >
              See All <ChevronRight size={14} />
            </Link>
          </div>

          {newArrivals.length === 0 ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 space-y-3">
                  <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-4">
              {newArrivals.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-52 sm:w-60 lg:w-64">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      {collections.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Browse by</p>
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                COLLECTIONS
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/shop?collection=${collection.slug}`}
                  className="flex-shrink-0 group relative w-52 sm:w-64 h-72 sm:h-80 overflow-hidden bg-gray-100"
                >
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white font-bold uppercase tracking-widest text-sm">
                      {collection.name}
                    </p>
                    {collection.description && (
                      <p className="text-gray-300 text-xs mt-1 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-[#c9a84c] text-xs uppercase tracking-widest font-medium">
                      Shop <ChevronRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BRAND STORY ── */}
      <section className="py-20 lg:py-32 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.3em] mb-6 font-medium">Who We Are</p>
          <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tight text-white mb-8">
            THE STORY
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            NAMMA AURAA was born from the streets, chai stalls, and chaos of everyday India. We believe that what you wear is a statement — of where you come from, what you stand for, and how you move through the world.
          </p>

          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            Our oversized tees are crafted from premium 240 GSM cotton, built to last, designed to make a statement. Every drop is rooted in Indian culture — the art, the language, the energy that makes this place unlike anything else.
          </p>

          {/* Quote */}
          <div className="border-l-4 border-[#c9a84c] pl-6 text-left mb-12 max-w-2xl mx-auto">
            <p className="text-white text-xl lg:text-2xl font-light italic leading-relaxed">
              &ldquo;We don&apos;t just make clothes. We make culture you can wear.&rdquo;
            </p>
            <p className="text-[#c9a84c] text-sm mt-3 uppercase tracking-widest">— NAMMA AURAA</p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 border border-white text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-white hover:text-[#0a0a0a] transition-all duration-300"
          >
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-16 lg:py-20 bg-[#f8f6f2]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.3em] mb-3 font-medium">Stay Updated</p>
          <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-[#0a0a0a] mb-3">
            JOIN THE CULTURE
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            New drops, exclusive deals, and stories from the streets. No spam, just culture.
          </p>

          {newsletterStatus === 'success' ? (
            <div className="py-6">
              <p className="text-[#c9a84c] font-semibold text-lg">Welcome to NAMMA AURAA ✦</p>
              <p className="text-gray-500 text-sm mt-2">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-0 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 border border-gray-300 border-r-0 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-[#0a0a0a] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
          {newsletterStatus === 'error' && (
            <p className="text-red-500 text-xs mt-3">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
