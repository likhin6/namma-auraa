'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { itemCount: cartCount, setIsOpen: setCartOpen } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop?filter=new', label: 'New Arrivals' },
    { href: '/shop?filter=collections', label: 'Collections' },
    { href: '/about', label: 'Our Story' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile: Hamburger */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} className="text-[#0a0a0a]" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
            >
              <Logo className="w-20 lg:w-24" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-widest text-[#0a0a0a] hover:text-[#c9a84c] transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Search */}
              <div className="relative flex items-center">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-36 lg:w-52 border-b border-[#0a0a0a] bg-transparent text-sm py-1 px-2 outline-none placeholder:text-gray-400 text-[#0a0a0a]"
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="p-2"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 hover:text-[#c9a84c] transition-colors"
                    aria-label="Search"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* Account */}
              <Link
                href={user ? '/account' : '/login'}
                className="p-2 hover:text-[#c9a84c] transition-colors hidden lg:block"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 hover:text-[#c9a84c] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#c9a84c] text-[#0a0a0a] text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 hover:text-[#c9a84c] transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#0a0a0a] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Logo className="w-[4.5rem]" />
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-6 py-8 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-gray-100 text-sm uppercase tracking-widest font-medium text-[#0a0a0a] hover:text-[#c9a84c] transition-colors"
                >
                  {link.label}
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ))}
              <Link
                href={user ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-gray-100 text-sm uppercase tracking-widest font-medium text-[#0a0a0a] hover:text-[#c9a84c] transition-colors"
              >
                {user ? 'My Account' : 'Login / Register'}
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            </nav>

            {/* Bottom */}
            <div className="px-6 py-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Made for the Culture</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
