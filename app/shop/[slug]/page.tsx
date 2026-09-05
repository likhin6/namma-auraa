'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShoppingBag, ChevronDown, ChevronUp, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

interface Variant {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  price: number | null;
  sku: string | null;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  category: string | null;
  collection_id: string | null;
  fabric: string | null;
  gsm: string | null;
  fit: string | null;
  print_type: string | null;
  wash_care: string | null;
  badge: string | null;
  new_arrival: boolean;
  bestseller: boolean;
  trending: boolean;
  featured: boolean;
  product_images: ProductImage[];
  product_variants: Variant[];
}

interface RelatedProduct {
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

const ACCORDION_ITEMS = [
  { key: 'fabric', label: 'Fabric & Material' },
  { key: 'fit', label: 'Fit & Sizing' },
  { key: 'print', label: 'Print Details' },
  { key: 'care', label: 'Wash Care' },
];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, setIsOpen } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('fabric');

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, description, price, mrp, category, collection_id,
          fabric, gsm, fit, print_type, wash_care, badge,
          new_arrival, bestseller, trending, featured,
          product_images(id, image_url, display_order),
          product_variants(id, size, color, stock, price, sku)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error || !data) {
        router.push('/shop');
        return;
      }

      const p = data as unknown as Product;
      // Sort images by display_order
      p.product_images.sort((a, b) => a.display_order - b.display_order);
      setProduct(p);

      trackEvent('product_view', p.id, { slug: p.slug, name: p.name });

      // Fetch related
      if (p.collection_id) {
        const { data: related } = await supabase
          .from('products')
          .select('id, name, slug, price, mrp, badge, new_arrival, bestseller, trending, featured, product_images(image_url)')
          .eq('published', true)
          .eq('collection_id', p.collection_id)
          .neq('id', p.id)
          .limit(4);
        setRelatedProducts((related as unknown as RelatedProduct[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant?.id ?? null, quantity);
      setIsOpen(true);
    } finally {
      setAddingToCart(false);
    }
  }

  function handleWishlist() {
    if (product) toggle(product.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3" />
              <div className="h-24 bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const images = product.product_images;
  const variants = product.product_variants ?? [];
  const sizes = [...new Set(variants.map((v) => v.size))];
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;
  const wishlisted = isWishlisted(product.id);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : variants.some((v) => v.stock > 0);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-gray-400 uppercase tracking-widest">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-[#0a0a0a] transition-colors">
            <ArrowLeft size={12} /> Back
          </button>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0a0a0a] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#0a0a0a] truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
              {images[activeImage]?.image_url ? (
                <img
                  src={images[activeImage].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-xs uppercase tracking-widest">No Image</span>
                </div>
              )}
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-[#c9a84c] text-[#0a0a0a] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-[#0a0a0a]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  {product.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#c9a84c] mb-2 block">
                      {product.badge}
                    </span>
                  )}
                  <h1 className="text-2xl lg:text-3xl font-black text-[#0a0a0a] uppercase tracking-tight leading-tight">
                    {product.name}
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href });
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-[#0a0a0a] transition-colors flex-shrink-0"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl font-bold text-[#0a0a0a]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-gray-400 line-through text-lg">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discount && (
                  <span className="bg-[#c9a84c] text-[#0a0a0a] text-xs font-bold px-2 py-0.5">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes. Free shipping on orders above ₹499.</p>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#0a0a0a]">
                    Select Size
                    {selectedVariant && <span className="ml-2 text-[#c9a84c]">{selectedVariant.size}</span>}
                  </h3>
                  <Link href="/contact" className="text-xs text-gray-400 underline hover:text-[#0a0a0a]">
                    Size Guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const variant = variants.find((v) => v.size === size);
                    const outOfStock = !variant || variant.stock === 0;
                    const isSelected = selectedVariant?.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedVariant(variant ?? null)}
                        disabled={outOfStock}
                        className={`w-14 h-12 text-sm border transition-all font-medium relative ${
                          isSelected
                            ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                            : outOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                            : 'border-gray-200 text-[#0a0a0a] hover:border-[#0a0a0a]'
                        }`}
                      >
                        {size}
                        {outOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="absolute w-full h-px bg-gray-300 rotate-45" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#0a0a0a] mb-3">Quantity</h3>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !inStock}
                className="flex-1 bg-[#0a0a0a] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                {!inStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 border flex items-center justify-center transition-all flex-shrink-0 ${
                  wishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-gray-200 text-gray-500 hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                }`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} className={wishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 py-4 border-t border-b border-gray-100">
              {['Free Delivery ₹499+', '7-Day Returns', 'Secure Payment', 'Made in India'].map((badge) => (
                <span key={badge} className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#c9a84c]" />
                  {badge}
                </span>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-0 border-t border-gray-100">
              {ACCORDION_ITEMS.map((item) => {
                const isOpen = openAccordion === item.key;
                let content = '';
                if (item.key === 'fabric') {
                  const parts = [
                    product.fabric && `Fabric: ${product.fabric}`,
                    product.gsm && `GSM: ${product.gsm}`,
                  ].filter(Boolean);
                  content = parts.join(' · ') || 'Premium quality fabric.';
                } else if (item.key === 'fit') {
                  content = product.fit || 'Relaxed oversized fit. We recommend sizing down if you prefer a regular oversized look.';
                } else if (item.key === 'print') {
                  content = product.print_type || 'High-quality print that lasts wash after wash.';
                } else if (item.key === 'care') {
                  content = product.wash_care || 'Machine wash cold. Do not bleach. Tumble dry low. Iron inside out.';
                }

                return (
                  <div key={item.key} className="border-b border-gray-100">
                    <button
                      onClick={() => setOpenAccordion(isOpen ? null : item.key)}
                      className="flex items-center justify-between w-full py-4 text-left"
                    >
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#0a0a0a]">
                        {item.label}
                      </span>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isOpen && (
                      <p className="text-sm text-gray-600 pb-4 leading-relaxed">{content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 lg:mt-28">
            <div className="mb-8">
              <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">You might also like</p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a]">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
