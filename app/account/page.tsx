'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Heart, ShoppingBag, LogOut, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackEvent } from '@/lib/analytics';

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const router = useRouter();

  const [profile, setProfile] = useState<{ name: string | null; email: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirect=/account');
      return;
    }
    fetchProfile();
  }, [user, authLoading]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user!.id)
        .maybeSingle();
      setProfile(data ?? { name: user!.user_metadata?.name ?? '', email: user!.email ?? '', phone: user!.user_metadata?.phone ?? '' });
      setEditName(data?.name ?? user!.user_metadata?.name ?? '');
      setEditPhone(data?.phone ?? user!.user_metadata?.phone ?? '');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('profiles').upsert({
        id: user!.id,
        name: editName,
        email: user!.email,
        phone: editPhone || null,
      });
      setProfile({ name: editName, email: user!.email, phone: editPhone });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await trackEvent('logout');
    await signOut();
    router.push('/');
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-100 rounded w-1/3" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Profile</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0a0a0a]">
            MY ACCOUNT
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Profile Card */}
        <div className="bg-white border border-gray-100 p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-[#c9a84c] hover:underline"
              >
                <Edit2 size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                >
                  <Check size={12} /> Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditName(profile?.name ?? ''); setEditPhone(profile?.phone ?? ''); }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:underline"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-[#f8f6f2] flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-[#c9a84c]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-gray-400">Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0a0a0a] mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#0a0a0a] mt-1">{profile?.name || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-[#f8f6f2] flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-[#c9a84c]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-gray-400">Email</p>
                <p className="text-sm font-medium text-[#0a0a0a] mt-1">{profile?.email || user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f8f6f2] flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-[#c9a84c]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-gray-400">Phone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Add phone number"
                    className="w-full border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0a0a0a] mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#0a0a0a] mt-1">{profile?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/wishlist" className="bg-white border border-gray-100 p-6 hover:border-[#c9a84c] transition-colors group">
            <Heart size={24} className="text-[#c9a84c] mb-3" />
            <p className="text-2xl font-black text-[#0a0a0a]">{wishlistCount}</p>
            <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Wishlist Items</p>
          </Link>
          <Link href="/cart" className="bg-white border border-gray-100 p-6 hover:border-[#c9a84c] transition-colors group">
            <ShoppingBag size={24} className="text-[#c9a84c] mb-3" />
            <p className="text-2xl font-black text-[#0a0a0a]">{cartCount}</p>
            <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Cart Items</p>
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full border border-[#0a0a0a] text-[#0a0a0a] py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#0a0a0a] hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <Footer />
    </div>
  );
}
