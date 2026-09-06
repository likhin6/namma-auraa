'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { useState } from 'react';
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      trackEvent('search', undefined, { query });
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query]);

  async function performSearch() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, mrp, badge, new_arrival, bestseller, trending, featured, product_images(image_url)')
        .eq('published', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(20);
      setResults((data as unknown as Product[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SearchIcon size={24} className="text-[#c9a84c]" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                SEARCH RESULTS
              </h1>
              {query && (
                <p className="text-gray-500 text-sm mt-1">
                  {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <SearchIcon size={64} className="text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-3">No Results</h2>
            <p className="text-gray-400 text-sm mb-8">
              {query ? `No products found for "${query}".` : 'Type something in the search bar above.'}
            </p>
            <a
              href="/shop"
              className="bg-[#0a0a0a] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 inline-block"
            >
              Browse All T-Shirts
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
