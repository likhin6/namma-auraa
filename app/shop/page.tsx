'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X, Search } from 'lucide-react';
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
  category: string | null;
  product_images: { image_url: string }[];
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const collectionParam = searchParams.get('collection');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    try {
      let query = supabase
        .from('products')
        .select('id, name, slug, price, mrp, badge, new_arrival, bestseller, trending, featured, category, product_images(image_url)', { count: 'exact' })
        .eq('published', true);

      // Apply filter params
      if (filterParam === 'new') query = query.eq('new_arrival', true);
      if (filterParam === 'featured') query = query.eq('featured', true);
      if (filterParam === 'bestseller') query = query.eq('bestseller', true);

      // Search
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      // Price range
      if (minPrice) query = query.gte('price', Number(minPrice));
      if (maxPrice) query = query.lte('price', Number(maxPrice));

      // Sort
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      }

      query = query.range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

      const { data, count } = await query;
      const products = (data as unknown as Product[]) ?? [];

      if (reset) {
        setProducts(products);
        setPage(0);
      } else {
        setProducts((prev) => [...prev, ...products]);
      }
      setTotal(count ?? 0);
      setHasMore((currentPage + 1) * PAGE_SIZE < (count ?? 0));
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, minPrice, maxPrice, sortBy, filterParam]);

  useEffect(() => {
    fetchProducts(true);
    trackEvent('page_view', undefined, { page: 'shop' });
  }, [searchQuery, minPrice, maxPrice, sortBy, filterParam]);

  useEffect(() => {
    if (page > 0) fetchProducts(false);
  }, [page]);

  function loadMore() {
    setPage((p) => p + 1);
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedSizes([]);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('recommended');
  }

  const hasActiveFilters = searchQuery || selectedSizes.length > 0 || minPrice || maxPrice || inStockOnly;

  const pageTitle = filterParam === 'new'
    ? 'New Arrivals'
    : filterParam === 'featured'
    ? 'Featured Drops'
    : filterParam === 'bestseller'
    ? 'Bestsellers'
    : 'Shop Oversized T-Shirts';

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">NAMMA AURAA</p>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
            {pageTitle.toUpperCase()}
          </h1>
          {total > 0 && (
            <p className="text-gray-500 text-sm mt-2">{total} styles</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#0a0a0a] transition-colors bg-white"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-[#0a0a0a] cursor-pointer min-w-[180px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="sm:hidden flex items-center gap-2 border border-gray-200 px-4 py-3 text-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className="hidden sm:block w-52 flex-shrink-0 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#0a0a0a]">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-[#c9a84c] hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Size */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Size</h4>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'border-gray-200 text-gray-700 hover:border-[#0a0a0a]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min ₹"
                  className="w-full border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#0a0a0a]"
                />
                <span className="text-gray-400 text-xs">–</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max ₹"
                  className="w-full border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#0a0a0a]"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Availability</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#0a0a0a]"
                />
                <span className="text-xs text-gray-700">In stock only</span>
              </label>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-black text-gray-200 uppercase tracking-widest mb-3">No Results</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearFilters}
                  className="text-xs uppercase tracking-widest border border-[#0a0a0a] px-8 py-3 hover:bg-[#0a0a0a] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="border border-[#0a0a0a] text-[#0a0a0a] px-10 py-3 text-xs uppercase tracking-widest hover:bg-[#0a0a0a] hover:text-white transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Size */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Size</h4>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Price Range</h4>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min ₹"
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max ₹"
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            {/* Availability */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#0a0a0a] w-4 h-4"
              />
              <span className="text-sm">In stock only</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={clearFilters}
                className="flex-1 border border-gray-200 py-3 text-sm uppercase tracking-widest"
              >
                Clear All
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 bg-[#0a0a0a] text-white py-3 text-sm uppercase tracking-widest"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
