-- Allow admin users to SELECT all products (including unpublished)
-- while keeping the public policy for non-admin users

DROP POLICY IF EXISTS "products_select_published_anon" ON products;

-- Public can see published products
CREATE POLICY "products_select_published" ON products FOR SELECT
  TO anon, authenticated
  USING (
    published = true
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Same for product_variants (already public, no change needed)
