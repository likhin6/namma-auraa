'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; email: string | null; phone: string | null; created_at: string; updated_at: string };
        Insert: { id: string; name?: string | null; email?: string | null; phone?: string | null };
        Update: { name?: string | null; email?: string | null; phone?: string | null };
      };
      collections: {
        Row: { id: string; name: string; slug: string; description: string | null; image_url: string | null; published: boolean; display_order: number; created_at: string };
        Insert: { name: string; slug: string; description?: string | null; image_url?: string | null; published?: boolean; display_order?: number };
        Update: { name?: string; slug?: string; description?: string | null; image_url?: string | null; published?: boolean; display_order?: number };
      };
      products: {
        Row: {
          id: string; name: string; slug: string; description: string | null;
          price: number; mrp: number | null; category: string | null; collection_id: string | null;
          fabric: string | null; gsm: string | null; fit: string | null; print_type: string | null;
          wash_care: string | null; published: boolean; featured: boolean; new_arrival: boolean;
          bestseller: boolean; trending: boolean; badge: string | null; tags: string[] | null;
          view_count: number; created_at: string; updated_at: string;
        };
        Insert: {
          name: string; slug: string; description?: string | null; price: number; mrp?: number | null;
          category?: string | null; collection_id?: string | null; fabric?: string | null; gsm?: string | null;
          fit?: string | null; print_type?: string | null; wash_care?: string | null; published?: boolean;
          featured?: boolean; new_arrival?: boolean; bestseller?: boolean; trending?: boolean;
          badge?: string | null; tags?: string[] | null;
        };
        Update: {
          name?: string; slug?: string; description?: string | null; price?: number; mrp?: number | null;
          category?: string | null; collection_id?: string | null; fabric?: string | null; gsm?: string | null;
          fit?: string | null; print_type?: string | null; wash_care?: string | null; published?: boolean;
          featured?: boolean; new_arrival?: boolean; bestseller?: boolean; trending?: boolean;
          badge?: string | null; tags?: string[] | null;
        };
      };
      product_images: {
        Row: { id: string; product_id: string; image_url: string; display_order: number; created_at: string };
        Insert: { product_id: string; image_url: string; display_order?: number };
        Update: { image_url?: string; display_order?: number };
      };
      product_variants: {
        Row: { id: string; product_id: string; size: string; color: string | null; sku: string | null; stock: number; price: number | null; created_at: string; updated_at: string };
        Insert: { product_id: string; size: string; color?: string | null; sku?: string | null; stock?: number; price?: number | null };
        Update: { size?: string; color?: string | null; sku?: string | null; stock?: number; price?: number | null };
      };
      carts: {
        Row: { id: string; user_id: string; created_at: string; updated_at: string };
        Insert: { user_id?: string };
        Update: {};
      };
      cart_items: {
        Row: { id: string; cart_id: string; product_id: string; variant_id: string | null; quantity: number; created_at: string };
        Insert: { cart_id: string; product_id: string; variant_id?: string | null; quantity?: number };
        Update: { quantity?: number };
      };
      wishlists: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: { user_id?: string; product_id: string };
        Update: {};
      };
      analytics_events: {
        Row: { id: string; anonymous_session_id: string | null; user_id: string | null; event_type: string; product_id: string | null; metadata: Record<string, unknown> | null; created_at: string };
        Insert: { anonymous_session_id?: string | null; user_id?: string | null; event_type: string; product_id?: string | null; metadata?: Record<string, unknown> | null };
        Update: {};
      };
      contact_submissions: {
        Row: { id: string; name: string; email: string; message: string; created_at: string };
        Insert: { name: string; email: string; message: string };
        Update: {};
      };
      newsletter_subscribers: {
        Row: { id: string; email: string; created_at: string };
        Insert: { email: string };
        Update: {};
      };
      admin_users: {
        Row: { id: string; user_id: string; created_at: string };
        Insert: { user_id: string };
        Update: {};
      };
    };
  };
};
