'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, itemCount, total, isOpen, setIsOpen, updateQuantity, removeFromCart } = useCart();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#0a0a0a]" />
            <span className="text-sm font-semibold uppercase tracking-widest text-[#0a0a0a]">
              Cart
            </span>
            {itemCount > 0 && (
              <span className="bg-[#0a0a0a] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:text-[#c9a84c] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="text-sm text-gray-500 uppercase tracking-widest mb-6">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="text-xs uppercase tracking-widest border border-[#0a0a0a] px-8 py-3 hover:bg-[#0a0a0a] hover:text-white transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const image = item.product?.product_images?.[0]?.image_url;
              return (
                <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={item.product?.name ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${item.product?.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-[#0a0a0a] line-clamp-2 hover:text-[#c9a84c] transition-colors leading-snug"
                      >
                        {item.product?.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {item.variant && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.variant.size}
                        {item.variant.color ? ` / ${item.variant.color}` : ''}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold text-[#0a0a0a]">
                        ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-gray-100 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 uppercase tracking-widest">Subtotal</span>
              <span className="text-lg font-semibold text-[#0a0a0a]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-xs text-gray-400 text-center">Shipping & taxes calculated at checkout</p>

            {/* Buttons */}
            <div className="space-y-2">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center border border-[#0a0a0a] text-[#0a0a0a] py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors"
              >
                View Cart
              </Link>
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 py-3 text-xs uppercase tracking-widest font-medium cursor-not-allowed"
              >
                Checkout — Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
