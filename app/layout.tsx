import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'NAMMA AURAA — Premium Indian Oversized T-Shirts',
  description:
    'NAMMA AURAA crafts premium oversized t-shirts rooted in Indian culture, chaos, and everyday moments. Made for the culture.',
  keywords: 'oversized t-shirts, Indian fashion, streetwear, NAMMA AURAA, premium cotton',
  openGraph: {
    title: 'NAMMA AURAA',
    description: 'Made for the culture.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white text-[#0a0a0a]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
