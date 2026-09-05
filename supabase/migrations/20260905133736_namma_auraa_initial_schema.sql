/*
# NAMMA AURAA — Initial Schema

## Summary
Sets up the complete database for NAMMA AURAA premium oversized T-shirt MVP.

## New Tables
1. `profiles` — User profile data linked to auth.users
2. `collections` — Product collections/categories (Desi, Kannada, etc.)
3. `products` — T-shirt products with all attributes
4. `product_images` — Multiple images per product
5. `product_variants` — Size/color variants with stock per product
6. `carts` — Shopping cart per user
7. `cart_items` — Items inside a cart
8. `wishlists` — Wishlist items per user
9. `newsletter_subscribers` — Email subscription list
10. `analytics_events` — First-party event tracking
11. `contact_submissions` — Contact form data
12. `admin_users` — Simple admin role table

## Security
- RLS enabled on all tables
- Public (anon + authenticated) can read published products, collections, images, variants
- Authenticated users manage their own carts, wishlists, profiles
- Admin actions use service role (enforced via admin_users table check in app layer)
- Analytics events writable by anon + authenticated for tracking
*/

-- =====================
-- PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- =====================
-- ADMIN USERS
-- =====================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_authenticated" ON admin_users;
CREATE POLICY "admin_users_select_authenticated" ON admin_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- =====================
-- COLLECTIONS
-- =====================
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collections_select_public" ON collections;
CREATE POLICY "collections_select_public" ON collections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "collections_insert_auth" ON collections;
CREATE POLICY "collections_insert_auth" ON collections FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "collections_update_auth" ON collections;
CREATE POLICY "collections_update_auth" ON collections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "collections_delete_auth" ON collections;
CREATE POLICY "collections_delete_auth" ON collections FOR DELETE
  TO authenticated USING (true);

-- =====================
-- PRODUCTS
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  mrp numeric(10,2),
  category text,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  fabric text,
  gsm text,
  fit text DEFAULT 'Oversized',
  print_type text,
  wash_care text,
  published boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT true,
  bestseller boolean NOT NULL DEFAULT false,
  trending boolean NOT NULL DEFAULT false,
  badge text,
  tags text[],
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_published_idx ON products(published);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);
CREATE INDEX IF NOT EXISTS products_collection_idx ON products(collection_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_published_anon" ON products;
CREATE POLICY "products_select_published_anon" ON products FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "products_insert_auth" ON products;
CREATE POLICY "products_insert_auth" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_auth" ON products;
CREATE POLICY "products_update_auth" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_delete_auth" ON products;
CREATE POLICY "products_delete_auth" ON products FOR DELETE
  TO authenticated USING (true);

-- =====================
-- PRODUCT IMAGES
-- =====================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_select_anon" ON product_images;
CREATE POLICY "product_images_select_anon" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "product_images_insert_auth" ON product_images;
CREATE POLICY "product_images_insert_auth" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "product_images_update_auth" ON product_images;
CREATE POLICY "product_images_update_auth" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "product_images_delete_auth" ON product_images;
CREATE POLICY "product_images_delete_auth" ON product_images FOR DELETE
  TO authenticated USING (true);

-- =====================
-- PRODUCT VARIANTS
-- =====================
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text,
  sku text,
  stock integer NOT NULL DEFAULT 0,
  price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variants_select_anon" ON product_variants;
CREATE POLICY "variants_select_anon" ON product_variants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "variants_insert_auth" ON product_variants;
CREATE POLICY "variants_insert_auth" ON product_variants FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "variants_update_auth" ON product_variants;
CREATE POLICY "variants_update_auth" ON product_variants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "variants_delete_auth" ON product_variants;
CREATE POLICY "variants_delete_auth" ON product_variants FOR DELETE
  TO authenticated USING (true);

-- =====================
-- CARTS
-- =====================
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_select_own" ON carts;
CREATE POLICY "carts_select_own" ON carts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_insert_own" ON carts;
CREATE POLICY "carts_insert_own" ON carts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_update_own" ON carts;
CREATE POLICY "carts_update_own" ON carts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_delete_own" ON carts;
CREATE POLICY "carts_delete_own" ON carts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =====================
-- CART ITEMS
-- =====================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items(cart_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select_own" ON cart_items;
CREATE POLICY "cart_items_select_own" ON cart_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_insert_own" ON cart_items;
CREATE POLICY "cart_items_insert_own" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_update_own" ON cart_items;
CREATE POLICY "cart_items_update_own" ON cart_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_delete_own" ON cart_items;
CREATE POLICY "cart_items_delete_own" ON cart_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

-- =====================
-- WISHLISTS
-- =====================
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlists_user_idx ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_select_own" ON wishlists;
CREATE POLICY "wishlists_select_own" ON wishlists FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_insert_own" ON wishlists;
CREATE POLICY "wishlists_insert_own" ON wishlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_delete_own" ON wishlists;
CREATE POLICY "wishlists_delete_own" ON wishlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =====================
-- NEWSLETTER SUBSCRIBERS
-- =====================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_insert_anon" ON newsletter_subscribers;
CREATE POLICY "newsletter_insert_anon" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- =====================
-- CONTACT SUBMISSIONS
-- =====================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_anon" ON contact_submissions;
CREATE POLICY "contact_insert_anon" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_auth" ON contact_submissions;
CREATE POLICY "contact_select_auth" ON contact_submissions FOR SELECT
  TO authenticated USING (true);

-- =====================
-- ANALYTICS EVENTS
-- =====================
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_product_idx ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_insert_anon" ON analytics_events;
CREATE POLICY "analytics_insert_anon" ON analytics_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_select_auth" ON analytics_events;
CREATE POLICY "analytics_select_auth" ON analytics_events FOR SELECT
  TO authenticated USING (true);

-- =====================
-- AUTO-UPDATE TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
