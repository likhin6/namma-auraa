'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { trackEvent } from '@/lib/analytics';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number | null;
    product_images: { image_url: string }[];
  };
  variant: { size: string; color: string | null } | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, variantId: string | null, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [], itemCount: 0, total: 0, loading: false,
  addToCart: async () => {}, removeFromCart: async () => {},
  updateQuantity: async () => {}, clearCart: () => {},
  isOpen: false, setIsOpen: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cart) { setItems([]); return; }

      const { data } = await supabase
        .from('cart_items')
        .select(`
          id, cart_id, product_id, variant_id, quantity,
          product:products(id, name, slug, price, mrp, product_images(image_url)),
          variant:product_variants(size, color)
        `)
        .eq('cart_id', cart.id);

      setItems((data as unknown as CartItem[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function getOrCreateCart(): Promise<string | null> {
    if (!user) return null;
    let { data: cart } = await supabase
      .from('carts').select('id').eq('user_id', user.id).maybeSingle();
    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts').insert({ user_id: user.id }).select('id').single();
      cart = newCart;
    }
    return cart?.id ?? null;
  }

  async function addToCart(productId: string, variantId: string | null, quantity = 1) {
    if (!user) return;
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('variant_id', variantId ?? '')
      .maybeSingle();

    if (existing) {
      await supabase.from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, variant_id: variantId, quantity });
    }

    await trackEvent('add_to_cart', productId);
    await fetchCart();
  }

  async function removeFromCart(itemId: string) {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await trackEvent('remove_from_cart');
    await fetchCart();
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) { await removeFromCart(itemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  }

  function clearCart() { setItems([]); }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addToCart, removeFromCart, updateQuantity, clearCart, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
