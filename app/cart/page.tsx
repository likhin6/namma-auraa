'use client';

import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeFromCart, loading } = useCart();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-[#c9a84c]" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
                MY CART
              </h1>
              {itemCount > 0 && (
                <p className="text-gray-500 text-sm mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/shop"
              className="bg-[#0a0a0a] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-300 inline-block"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="hidden sm:grid grid-cols-4 text-[10px] uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">
                <span className="col-span-2">Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              {items.map((item) => {
                const image = item.product?.product_images?.[0]?.image_url;
                const itemTotal = (item.product?.price ?? 0) * item.quantity;
                return (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-6 border-b border-gray-100 items-start">
                    {/* Product info */}
                    <div className="sm:col-span-2 flex gap-4">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {image ? (
                          <img src={image} alt={item.product?.name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/shop/${item.product?.slug}`}
                          className="text-sm font-semibold text-[#0a0a0a] hover:text-[#c9a84c] transition-colors leading-snug line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-gray-400 mt-1">
                            Size: {item.variant.size}
                            {item.variant.color ? ` / ${item.variant.color}` : ''}
                          </p>
                        )}
                        <p className="text-sm font-medium text-[#0a0a0a] mt-2 sm:hidden">
                          ₹{(item.product?.price ?? 0).toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex sm:justify-center">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="hidden sm:flex justify-end items-start">
                      <span className="text-sm font-semibold text-[#0a0a0a]">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#f8f6f2] p-6 space-y-4 sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-[#0a0a0a]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={total >= 499 ? 'text-green-600 font-medium' : 'font-medium text-[#0a0a0a]'}>
                      {total >= 499 ? 'FREE' : '₹49'}
                    </span>
                  </div>
                  {total < 499 && (
                    <p className="text-xs text-[#c9a84c]">
                      Add ₹{(499 - total).toLocaleString('en-IN')} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-[#0a0a0a]">
                    <span>Total</span>
                    <span>₹{(total + (total >= 499 ? 0 : 49)).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout coming soon */}
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 py-4 text-xs uppercase tracking-widest font-semibold cursor-not-allowed"
                >
                  Checkout — Coming Soon
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-3">or</p>
                  <Link
                    href="/shop"
                    className="text-xs text-[#0a0a0a] underline hover:text-[#c9a84c] transition-colors flex items-center justify-center gap-1"
                  >
                    Continue Shopping <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Trust */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {['Secure Payment', '7-Day Easy Returns', 'Made in India'].map((t) => (
                    <p key={t} className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#c9a84c] flex-shrink-0" />
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
