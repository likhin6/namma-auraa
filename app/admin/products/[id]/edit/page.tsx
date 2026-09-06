'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BADGES = ['', 'NEW', 'BESTSELLER', 'TRENDING', 'LIMITED EDITION'];
const CATEGORIES = ['Printed', 'Graphic', 'Typography', 'Kannada', 'Desi'];

interface Collection { id: string; name: string }
interface Variant { id?: string; size: string; color: string; sku: string; stock: string }
interface ImageRow { id?: string; image_url: string }

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteImgId, setDeleteImgId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    name: '', slug: '', description: '', price: '', mrp: '', category: 'Printed',
    collection_id: '', fabric: '', gsm: '', fit: 'Oversized', print_type: '', wash_care: '',
    published: true, featured: false, new_arrival: true, bestseller: false, trending: false,
    badge: '', tags: '',
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);

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
      const { data: cols } = await supabase.from('collections').select('id, name').order('display_order');
      setCollections(cols ?? []);
      fetchProduct();
    } finally {
      setChecking(false);
    }
  }

  async function fetchProduct() {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants(id, size, color, sku, stock),
          product_images(id, image_url, display_order)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) { router.push('/admin/products'); return; }

      setForm({
        name: data.name || '', slug: data.slug || '', description: data.description || '',
        price: data.price ?? '', mrp: data.mrp ?? '', category: data.category || 'Printed',
        collection_id: data.collection_id || '', fabric: data.fabric || '', gsm: data.gsm || '',
        fit: data.fit || 'Oversized', print_type: data.print_type || '', wash_care: data.wash_care || '',
        published: data.published, featured: data.featured, new_arrival: data.new_arrival,
        bestseller: data.bestseller, trending: data.trending, badge: data.badge || '',
        tags: (data.tags || []).join(', '),
      });

      const variantsData = (data.product_variants || []) as Array<{ id: string; size: string; color: string | null; sku: string | null; stock: number }>;
      const allVariants: Variant[] = SIZES.map(size => {
        const existing = variantsData.find(v => v.size === size);
        return existing
          ? { id: existing.id, size: existing.size, color: existing.color || 'Black', sku: existing.sku || '', stock: String(existing.stock ?? 0) }
          : { size, color: 'Black', sku: '', stock: '0' };
      });
      setVariants(allVariants);

      const imagesData = (data.product_images || []) as Array<{ id: string; image_url: string; display_order: number }>;
      const sortedImages = imagesData.sort((a, b) => a.display_order - b.display_order);
      setImages(sortedImages.length > 0 ? sortedImages.map(img => ({ id: img.id, image_url: img.image_url })) : [{ image_url: '' }]);
    } finally {
      setLoadingData(false);
    }
  }

  function updateForm(key: string, value: string | boolean) {
    setForm((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));
  }

  function updateVariant(index: number, key: string, value: string) {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [key]: value } : v));
  }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('products').update({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
        category: form.category || null,
        collection_id: form.collection_id || null,
        fabric: form.fabric || null,
        gsm: form.gsm || null,
        fit: form.fit || null,
        print_type: form.print_type || null,
        wash_care: form.wash_care || null,
        published: form.published,
        featured: form.featured,
        new_arrival: form.new_arrival,
        bestseller: form.bestseller,
        trending: form.trending,
        badge: form.badge || null,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
      }).eq('id', id);

      if (error) throw error;

      // Upsert variants
      for (const v of variants) {
        const variantData = {
          product_id: id,
          size: v.size,
          color: v.color || null,
          sku: v.sku || null,
          stock: Number(v.stock) || 0,
        };
        if (v.id) {
          await supabase.from('product_variants').update(variantData).eq('id', v.id);
        } else {
          await supabase.from('product_variants').insert(variantData);
        }
      }

      // Upsert images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.image_url.trim()) continue;
        if (img.id) {
          await supabase.from('product_images').update({ image_url: img.image_url.trim(), display_order: i }).eq('id', img.id);
        } else {
          await supabase.from('product_images').insert({ product_id: id, image_url: img.image_url.trim(), display_order: i });
        }
      }

      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteImage() {
    if (!deleteImgId) return;
    await supabase.from('product_images').delete().eq('id', deleteImgId);
    setImages(prev => prev.filter(img => img.id !== deleteImgId));
    setDeleteImgId(null);
    toast.success('Image removed');
  }

  if (checking || authLoading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f6f2]"><p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/products" className="p-2 -ml-2 text-gray-400 hover:text-[#0a0a0a] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-1 font-medium">Admin</p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-[#0a0a0a]">Edit Product</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Product Name *</label>
                <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Category</label>
                <select value={form.category} onChange={e => updateForm('category', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a] bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Description</label>
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a] resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => updateForm('price', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={e => updateForm('mrp', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Collection</label>
                <select value={form.collection_id} onChange={e => updateForm('collection_id', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a] bg-white">
                  <option value="">None</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Badge</label>
                <select value={form.badge} onChange={e => updateForm('badge', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a] bg-white">
                  {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={e => updateForm('tags', e.target.value)} placeholder="bengaluru, humour, desi" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ k: 'fabric', l: 'Fabric' }, { k: 'gsm', l: 'GSM' }, { k: 'fit', l: 'Fit' }, { k: 'print_type', l: 'Print Type' }].map(f => (
                <div key={f.k} className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-gray-500">{f.l}</label>
                  <input type="text" value={form[f.k]} onChange={e => updateForm(f.k, e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs uppercase tracking-widest text-gray-500">Wash Care</label>
                <input type="text" value={form.wash_care} onChange={e => updateForm('wash_care', e.target.value)} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0a]" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Variants & Inventory</h2>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={v.size} className="grid grid-cols-5 gap-2 items-center">
                  <span className="text-sm font-medium text-[#0a0a0a] text-center">{v.size}</span>
                  <input type="text" placeholder="Color" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#0a0a0a]" />
                  <input type="text" placeholder="SKU" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#0a0a0a]" />
                  <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#0a0a0a]" />
                  <span className={`text-xs text-center ${Number(v.stock) === 0 ? 'text-red-500' : Number(v.stock) < 10 ? 'text-[#c9a84c]' : 'text-green-600'}`}>
                    {Number(v.stock) === 0 ? 'Out of stock' : Number(v.stock) < 10 ? 'Low stock' : 'In stock'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Product Images</h2>
            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {img.image_url && (
                    <div className="w-12 h-14 bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="url"
                    value={img.image_url}
                    onChange={e => setImages(prev => prev.map((im, idx) => idx === i ? { ...im, image_url: e.target.value } : im))}
                    placeholder="https://images.pexels.com/..."
                    className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0a0a0a]"
                  />
                  {img.id && (
                    <button onClick={() => setDeleteImgId(img.id!)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                  {images.length > 1 && !img.id && (
                    <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setImages(prev => [...prev, { image_url: '' }])} className="text-xs text-[#c9a84c] flex items-center gap-1 hover:underline">
                <Plus size={12} /> Add another image
              </button>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Visibility & Flags</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { k: 'published', l: 'Published' },
                { k: 'featured', l: 'Featured' },
                { k: 'new_arrival', l: 'New Arrival' },
                { k: 'bestseller', l: 'Bestseller' },
                { k: 'trending', l: 'Trending' },
              ].map(f => (
                <label key={f.k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[f.k]} onChange={e => updateForm(f.k, e.target.checked)} className="accent-[#0a0a0a] w-4 h-4" />
                  <span className="text-sm text-gray-700">{f.l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-[#0a0a0a] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors disabled:opacity-50 flex items-center gap-2">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/products" className="border border-gray-200 px-8 py-3 text-xs uppercase tracking-widest font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteImgId} onOpenChange={(open) => !open && setDeleteImgId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this image?</AlertDialogTitle>
            <AlertDialogDescription>The image will be removed from the product.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImage} className="bg-red-500 text-white hover:bg-red-600">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
