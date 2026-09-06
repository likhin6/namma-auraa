'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Users, Eye, Heart, ShoppingCart, TrendingUp, ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    outOfStockVariants: 0,
    totalUsers: 0,
    productViews: 0,
    wishlistAdds: 0,
    cartAdds: 0,
    topSearches: [] as { term: string; count: number }[],
  });
  const [topProducts, setTopProducts] = useState<{ name: string; views: number; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/admin/login');
      return;
    }
    checkAdmin();
  }, [user, authLoading]);

  async function checkAdmin() {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (!data) {
        router.push('/admin/login');
        return;
      }
      setIsAdmin(true);
      fetchStats();
    } finally {
      setChecking(false);
    }
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const [productsRes, publishedRes, outOfStockRes, viewsRes, wishlistRes, cartRes, searchesRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('product_variants').select('id', { count: 'exact', head: true }).eq('stock', 0),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'product_view'),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'wishlist_add'),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'add_to_cart'),
        supabase.from('analytics_events').select('metadata').eq('event_type', 'search').limit(50),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      // Top products by views — fetch from analytics_events joined with products
      const { data: viewEvents } = await supabase
        .from('analytics_events')
        .select('product_id, product:products(name, slug)')
        .eq('event_type', 'product_view')
        .not('product_id', 'is', null)
        .limit(100);

      const productViewCounts: Record<string, { name: string; slug: string; views: number }> = {};
      (viewEvents ?? []).forEach((e: Record<string, unknown>) => {
        const productId = e.product_id as string | null;
        const product = e.product as { name: string; slug: string } | null;
        if (!productId || !product) return;
        if (!productViewCounts[productId]) {
          productViewCounts[productId] = { name: product.name, slug: product.slug, views: 0 };
        }
        productViewCounts[productId].views++;
      });
      setTopProducts(Object.values(productViewCounts).sort((a, b) => b.views - a.views).slice(0, 5));

      // Search terms
      const searchMap: Record<string, number> = {};
      (searchesRes.data ?? []).forEach((e: Record<string, unknown>) => {
        const metadata = e.metadata as Record<string, unknown> | null;
        const term = metadata?.query;
        if (typeof term === 'string') searchMap[term] = (searchMap[term] || 0) + 1;
      });
      const topSearches = Object.entries(searchMap).map(([term, count]) => ({ term, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      setStats({
        totalProducts: productsRes.count ?? 0,
        publishedProducts: publishedRes.count ?? 0,
        outOfStockVariants: outOfStockRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        productViews: viewsRes.count ?? 0,
        wishlistAdds: wishlistRes.count ?? 0,
        cartAdds: cartRes.count ?? 0,
        topSearches,
      });
    } finally {
      setLoading(false);
    }
  }

  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f2]">
        <p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-[#0a0a0a]' },
    { label: 'Published', value: stats.publishedProducts, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Out of Stock', value: stats.outOfStockVariants, icon: Package, color: 'text-red-500' },
    { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'text-[#c9a84c]' },
    { label: 'Product Views', value: stats.productViews, icon: Eye, color: 'text-blue-500' },
    { label: 'Wishlist Adds', value: stats.wishlistAdds, icon: Heart, color: 'text-red-400' },
    { label: 'Cart Adds', value: stats.cartAdds, icon: ShoppingCart, color: 'text-[#0a0a0a]' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-1 font-medium">Admin</p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-[#0a0a0a]">Dashboard</h1>
          </div>
          <Link
            href="/admin/products"
            className="bg-[#0a0a0a] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors flex items-center gap-2 w-fit"
          >
            Manage Products <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-100 p-6 space-y-2">
                  <stat.icon size={20} className={stat.color} />
                  <p className="text-2xl lg:text-3xl font-black text-[#0a0a0a]">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Top Products & Searches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] mb-4">Most Viewed Products</h2>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">No product views yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <Link key={p.slug} href={`/shop/${p.slug}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors -mx-2 px-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                          <span className="text-sm text-[#0a0a0a] truncate">{p.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#c9a84c] flex items-center gap-1 flex-shrink-0">
                          <Eye size={12} /> {p.views}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Searches */}
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] mb-4">Top Search Terms</h2>
                {stats.topSearches.length === 0 ? (
                  <p className="text-sm text-gray-400">No searches yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSearches.map((s, i) => (
                      <div key={s.term} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                          <span className="text-sm text-[#0a0a0a] truncate flex items-center gap-1">
                            <Search size={12} className="text-gray-400" /> {s.term}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[#c9a84c] flex-shrink-0">{s.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
