'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

interface WishlistProduct {
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

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { itemCount } = useWishlist();
  const router = useRouter();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [user, authLoading]);

  async function fetchWishlist() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('wishlists')
        .select(`
          product_id,
          product:products(
            id, name, slug, price, mrp, badge,
            new_arrival, bestseller, trending, featured,
            product_images(image_url)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      const items = (data ?? [])
        .flatMap((w: { product: WishlistProduct[] }) => w.product)
        .filter((p: WishlistProduct | undefined): p is WishlistProduct => p !== undefined);
      setProducts(items);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-[#c9a84c]" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                MY WISHLIST
              </h1>
              {products.length > 0 && (
                <p className="text-gray-500 text-sm mt-1">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={64} className="text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-3">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Save your favourite styles to come back to them later.
            </p>
            <Link
              href="/shop"
              className="bg-[#0a0a0a] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 inline-block"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
