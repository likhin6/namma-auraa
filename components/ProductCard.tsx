'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

interface ProductImage {
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number | null;
  badge?: string | null;
  new_arrival?: boolean;
  bestseller?: boolean;
  trending?: boolean;
  featured?: boolean;
  product_images?: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const images = product.product_images ?? [];
  const primaryImage = images[0]?.image_url;
  const secondaryImage = images[1]?.image_url;

  const wishlisted = isWishlisted(product.id);

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const badge =
    product.badge ||
    (product.new_arrival ? 'NEW' : product.bestseller ? 'BESTSELLER' : product.trending ? 'TRENDING' : null);

  const badgeColor: Record<string, string> = {
    NEW: 'bg-[#c9a84c] text-[#0a0a0a]',
    BESTSELLER: 'bg-[#0a0a0a] text-white',
    TRENDING: 'bg-[#0a0a0a] text-white',
    'LIMITED EDITION': 'bg-[#c9a84c] text-[#0a0a0a]',
    FEATURED: 'bg-[#0a0a0a] text-white',
  };

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await toggle(product.id);
  }

  return (
    <div className="group relative">
      <Link href={`/shop/${product.slug}`} className="block">
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] bg-gray-100 overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {primaryImage && !imgError ? (
            <>
              {/* Primary image */}
              <img
                src={primaryImage}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  hovered && secondaryImage ? 'opacity-0' : 'opacity-100'
                } group-hover:scale-105`}
                onError={() => setImgError(true)}
              />
              {/* Secondary image (hover) */}
              {secondaryImage && (
                <img
                  src={secondaryImage}
                  alt={`${product.name} alternate`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    hovered ? 'opacity-100' : 'opacity-0'
                  } scale-105`}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded" />
                <p className="text-xs text-gray-400 uppercase tracking-widest">No Image</p>
              </div>
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3">
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${
                  badgeColor[badge.toUpperCase()] || 'bg-[#0a0a0a] text-white'
                }`}
              >
                {badge}
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-3 right-12">
              <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-1">
                -{discount}%
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:scale-110 ${
              wishlisted ? 'text-red-500' : 'text-gray-600'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              className={wishlisted ? 'fill-red-500' : ''}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight line-clamp-2 group-hover:text-[#c9a84c] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0a0a0a]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            {discount && (
              <span className="text-xs text-[#c9a84c] font-medium">{discount}% off</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
