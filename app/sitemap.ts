import { supabase } from '@/lib/supabase';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: '', lastModified: new Date(), priority: 1.0 },
    { url: 'shop', lastModified: new Date(), priority: 0.9 },
    { url: 'about', lastModified: new Date(), priority: 0.6 },
    { url: 'contact', lastModified: new Date(), priority: 0.6 },
    { url: 'login', lastModified: new Date(), priority: 0.4 },
    { url: 'register', lastModified: new Date(), priority: 0.4 },
    { url: 'privacy', lastModified: new Date(), priority: 0.3 },
    { url: 'terms', lastModified: new Date(), priority: 0.3 },
  ];

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('published', true);

  const productPages = (products ?? []).map((p) => ({
    url: `shop/${p.slug}`,
    lastModified: new Date(p.updated_at),
    priority: 0.8,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nammaauraa.com';

  return [...staticPages, ...productPages].map(page => ({
    url: `${baseUrl}/${page.url}`.replace(/\/$/, ''),
    lastModified: page.lastModified,
    priority: page.priority,
  }));
}
