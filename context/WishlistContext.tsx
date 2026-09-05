'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { trackEvent } from '@/lib/analytics';

interface WishlistContextType {
  wishlistIds: Set<string>;
  itemCount: number;
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(), itemCount: 0, loading: false,
  toggle: async () => {}, isWishlisted: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);
      setWishlistIds(new Set((data ?? []).map((w) => w.product_id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  async function toggle(productId: string) {
    if (!user) return;
    if (wishlistIds.has(productId)) {
      await supabase.from('wishlists').delete()
        .eq('user_id', user.id).eq('product_id', productId);
      setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      await trackEvent('wishlist_remove', productId);
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      setWishlistIds(prev => new Set([...prev, productId]));
      await trackEvent('wishlist_add', productId);
    }
  }

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, itemCount: wishlistIds.size, loading, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
