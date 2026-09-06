'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowLeft, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string | null;
  published: boolean;
  featured: boolean;
  product_images: { image_url: string }[];
}

export default function AdminProducts() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/admin/login'); return; }
    checkAdmin();
  }, [user, authLoading]);

  async function checkAdmin() {
    try {
      const { data } = await supabase.from('admin_users').select('id').eq('user_id', user!.id).maybeSingle();
      if (!data) { router.push('/admin/login'); return; }
      setIsAdmin(true);
      fetchProducts();
    } finally {
      setChecking(false);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, category, published, featured, product_images(image_url)')
        .order('created_at', { ascending: false });
      setProducts((data as unknown as Product[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublished(product: Product) {
    const newVal = !product.published;
    await supabase.from('products').update({ published: newVal }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, published: newVal } : p));
    toast.success(newVal ? 'Product published' : 'Product unpublished');
  }

  async function toggleFeatured(product: Product) {
    const newVal = !product.featured;
    await supabase.from('products').update({ featured: newVal }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: newVal } : p));
    toast.success(newVal ? 'Marked as featured' : 'Removed from featured');
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
    toast.success('Product deleted');
  }

  if (checking || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f6f2]"><p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 -ml-2 text-gray-400 hover:text-[#0a0a0a] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-1 font-medium">Admin</p>
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-[#0a0a0a]">Products</h1>
            </div>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-[#0a0a0a] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors flex items-center gap-2 w-fit"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-400 mb-4">No products yet.</p>
            <Link href="/admin/products/new" className="text-xs uppercase tracking-widest text-[#c9a84c] hover:underline">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-center py-3 px-4 font-medium">Published</th>
                    <th className="text-center py-3 px-4 font-medium">Featured</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-gray-100 overflow-hidden flex-shrink-0">
                            {p.product_images?.[0]?.image_url && (
                              <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#0a0a0a] truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{p.category || '—'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#0a0a0a]">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => togglePublished(p)} className={`p-1.5 ${p.published ? 'text-green-600' : 'text-gray-300'}`}>
                          {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => toggleFeatured(p)} className={`text-xs px-2 py-1 ${p.featured ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-gray-300'}`}>
                          {p.featured ? 'Featured' : '—'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-[#0a0a0a] transition-colors">
                            <Edit2 size={14} />
                          </Link>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex gap-3">
                  <div className="w-14 h-16 bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.product_images?.[0]?.image_url && (
                      <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0a0a0a] truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">₹{p.price.toLocaleString('en-IN')} · {p.category || 'Uncategorized'}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => togglePublished(p)} className={`text-xs flex items-center gap-1 ${p.published ? 'text-green-600' : 'text-gray-300'}`}>
                        {p.published ? <Eye size={12} /> : <EyeOff size={12} />} {p.published ? 'Published' : 'Hidden'}
                      </button>
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-[#c9a84c] flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </Link>
                      <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-400 flex items-center gap-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The product and all its variants and images will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
