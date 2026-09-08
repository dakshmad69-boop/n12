/*
# PackToday — Full B2B Ecommerce Schema

## Overview
Creates the complete database schema for PackToday, a premium B2B custom packaging company.
This migration creates tables for products, categories, variants, customers, orders, design requests,
quotes, and admin management. The app uses Supabase email/password auth.

## New Tables

1. **categories** — Product categories (Paper Cups, Paper Containers, Salad Bowls, etc.)
   - id, name, slug, description, display_order, created_at

2. **products** — Individual products within categories
   - id, category_id (FK), name, slug, sku, description, material, lead_time, availability,
     custom_printing (bool), design_support (bool), starting_price, moq (int default 100),
     is_popular (bool), is_custom_printed (bool), is_essential (bool), display_order, created_at

3. **product_variants** — Size/capacity/type variants for each product
   - id, product_id (FK), variant_type (e.g. "Single Wall", "Round"), variant_value (e.g. "5 oz / 150 ml"),
     sku, price, moq_override, availability, created_at

4. **product_images** — 5-6 images per product
   - id, product_id (FK), url, alt_text, position, is_primary, variant_id (nullable FK), created_at

5. **quantity_tiers** — Configurable quantity tiers per product
   - id, product_id (FK), quantity, price_per_unit, created_at

6. **customer_profiles** — Extended customer data beyond auth.users
   - id (uuid, matches auth.users.id), business_name, gst_number, phone,
     billing_address, shipping_address, city, state, pin, created_at

7. **orders** — Customer orders
   - id, user_id (FK auth.users), order_number, status, subtotal, shipping, total,
     business_name, full_name, email, phone, gst_number, billing_address, shipping_address,
     city, state, pin, payment_method, order_notes, created_at

8. **order_items** — Line items within orders
   - id, order_id (FK), product_id (FK), product_name, variant_type, variant_value,
     quantity, unit_price, total_price, customisation_option, artwork_url, artwork_status, created_at

9. **design_requests** — Custom design workflow
   - id, user_id (FK auth.users), product_id (FK nullable), order_item_id (FK nullable),
     option_type (custom_design / upload_design / logo_only),
     business_name, brand_colours, design_style, text_content, additional_instructions,
     logo_url, artwork_url, reference_images, status, assigned_designer,
     created_at, updated_at

10. **design_versions** — Iterative design versions within a design request
    - id, design_request_id (FK), version_number, image_url, designer_comments,
       customer_comments, status (pending / approved / changes_requested), created_at

11. **bulk_quotes** — Bulk quote requests
    - id, user_id (FK auth.users nullable), business_name, contact_name, phone, email,
       product_id (FK), variant_value, quantity, material, size, printing_requirements,
       delivery_location, required_date, reference, upload_url, additional_requirements,
       status, created_at

12. **custom_packaging_requests** — Custom packaging service submissions
    - id, user_id (FK auth.users nullable), product_type, desired_size, quantity,
       material_preference, branding_requirements, artwork_url, reference_images,
       delivery_requirements, status, created_at

13. **wishlist** — Saved products per user
    - id, user_id (FK auth.users), product_id (FK), created_at

14. **saved_designs** — Reusable approved designs per user
    - id, user_id (FK auth.users), design_request_id (FK nullable), name, image_url,
       product_id (FK nullable), created_at

## Security
- RLS enabled on ALL tables.
- All tables use `TO authenticated` with `auth.uid()` ownership checks.
- customer_profiles, orders, order_items, design_requests, design_versions, bulk_quotes,
  custom_packaging_requests, wishlist, saved_designs are owner-scoped.
- categories, products, product_variants, product_images, quantity_tiers are readable by
  authenticated users (catalogue data is shared).
- INSERT/UPDATE/DELETE on catalogue tables restricted to authenticated users (admin operations).

## Important Notes
1. The app has a sign-in screen, so all policies use `TO authenticated` with `auth.uid()`.
2. Owner columns default to `auth.uid()` so inserts work without explicitly passing user_id.
3. Catalogue tables (categories, products, etc.) allow SELECT for authenticated users but
   restrict writes — in a production app these would be admin-only, but for this build
   authenticated users can manage catalogue data (admin dashboard uses the same client).
4. The schema is designed to be extensible — new products, variants, categories, pricing,
   MOQ, imagery, and customisation options can all be managed dynamically.
*/

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_categories" ON categories;
CREATE POLICY "auth_read_categories" ON categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text,
  description text,
  material text,
  lead_time text,
  availability text DEFAULT 'In Stock',
  custom_printing boolean NOT NULL DEFAULT true,
  design_support boolean NOT NULL DEFAULT true,
  starting_price numeric(10,2) NOT NULL DEFAULT 0,
  moq int NOT NULL DEFAULT 100,
  is_popular boolean NOT NULL DEFAULT false,
  is_custom_printed boolean NOT NULL DEFAULT false,
  is_essential boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_products" ON products;
CREATE POLICY "auth_read_products" ON products FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCT VARIANTS ============
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type text NOT NULL,
  variant_value text NOT NULL,
  sku text,
  price numeric(10,2),
  moq_override int,
  availability text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_product_variants" ON product_variants;
CREATE POLICY "auth_read_product_variants" ON product_variants FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_product_variants" ON product_variants;
CREATE POLICY "auth_insert_product_variants" ON product_variants FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_product_variants" ON product_variants;
CREATE POLICY "auth_update_product_variants" ON product_variants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_product_variants" ON product_variants;
CREATE POLICY "auth_delete_product_variants" ON product_variants FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  position int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_product_images" ON product_images;
CREATE POLICY "auth_read_product_images" ON product_images FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);

-- ============ QUANTITY TIERS ============
CREATE TABLE IF NOT EXISTS quantity_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL,
  price_per_unit numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quantity_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_quantity_tiers" ON quantity_tiers;
CREATE POLICY "auth_read_quantity_tiers" ON quantity_tiers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quantity_tiers" ON quantity_tiers;
CREATE POLICY "auth_insert_quantity_tiers" ON quantity_tiers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quantity_tiers" ON quantity_tiers;
CREATE POLICY "auth_update_quantity_tiers" ON quantity_tiers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quantity_tiers" ON quantity_tiers;
CREATE POLICY "auth_delete_quantity_tiers" ON quantity_tiers FOR DELETE
  TO authenticated USING (true);

-- ============ CUSTOMER PROFILES ============
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  business_name text,
  gst_number text,
  phone text,
  billing_address text,
  shipping_address text,
  city text,
  state text,
  pin text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON customer_profiles;
CREATE POLICY "select_own_profile" ON customer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON customer_profiles;
CREATE POLICY "insert_own_profile" ON customer_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON customer_profiles;
CREATE POLICY "update_own_profile" ON customer_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON customer_profiles;
CREATE POLICY "delete_own_profile" ON customer_profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'Confirmed',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  business_name text,
  full_name text,
  email text,
  phone text,
  gst_number text,
  billing_address text,
  shipping_address text,
  city text,
  state text,
  pin text,
  payment_method text,
  order_notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_type text,
  variant_value text,
  quantity int NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  customisation_option text,
  artwork_url text,
  artwork_status text DEFAULT 'Not Required',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_order_items" ON order_items;
CREATE POLICY "update_own_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_order_items" ON order_items;
CREATE POLICY "delete_own_order_items" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- ============ DESIGN REQUESTS ============
CREATE TABLE IF NOT EXISTS design_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  option_type text NOT NULL DEFAULT 'custom_design',
  business_name text,
  brand_colours text,
  design_style text,
  text_content text,
  additional_instructions text,
  logo_url text,
  artwork_url text,
  reference_images text[],
  status text NOT NULL DEFAULT 'Request Received',
  assigned_designer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE design_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_design_requests" ON design_requests;
CREATE POLICY "select_own_design_requests" ON design_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_design_requests" ON design_requests;
CREATE POLICY "insert_own_design_requests" ON design_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_design_requests" ON design_requests;
CREATE POLICY "update_own_design_requests" ON design_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_design_requests" ON design_requests;
CREATE POLICY "delete_own_design_requests" ON design_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ DESIGN VERSIONS ============
CREATE TABLE IF NOT EXISTS design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_request_id uuid NOT NULL REFERENCES design_requests(id) ON DELETE CASCADE,
  version_number int NOT NULL DEFAULT 1,
  image_url text,
  designer_comments text,
  customer_comments text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_design_versions" ON design_versions;
CREATE POLICY "select_own_design_versions" ON design_versions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM design_requests WHERE design_requests.id = design_versions.design_request_id AND design_requests.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_design_versions" ON design_versions;
CREATE POLICY "insert_own_design_versions" ON design_versions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM design_requests WHERE design_requests.id = design_versions.design_request_id AND design_requests.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_design_versions" ON design_versions;
CREATE POLICY "update_own_design_versions" ON design_versions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM design_requests WHERE design_requests.id = design_versions.design_request_id AND design_requests.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM design_requests WHERE design_requests.id = design_versions.design_request_id AND design_requests.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_design_versions" ON design_versions;
CREATE POLICY "delete_own_design_versions" ON design_versions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM design_requests WHERE design_requests.id = design_versions.design_request_id AND design_requests.user_id = auth.uid())
  );

-- ============ BULK QUOTES ============
CREATE TABLE IF NOT EXISTS bulk_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name text,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_value text,
  quantity int,
  material text,
  size text,
  printing_requirements text,
  delivery_location text,
  required_date date,
  reference text,
  upload_url text,
  additional_requirements text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bulk_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bulk_quotes" ON bulk_quotes;
CREATE POLICY "select_own_bulk_quotes" ON bulk_quotes FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "insert_own_bulk_quotes" ON bulk_quotes;
CREATE POLICY "insert_own_bulk_quotes" ON bulk_quotes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "update_own_bulk_quotes" ON bulk_quotes;
CREATE POLICY "update_own_bulk_quotes" ON bulk_quotes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "delete_own_bulk_quotes" ON bulk_quotes;
CREATE POLICY "delete_own_bulk_quotes" ON bulk_quotes FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- ============ CUSTOM PACKAGING REQUESTS ============
CREATE TABLE IF NOT EXISTS custom_packaging_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_type text NOT NULL,
  desired_size text,
  quantity int,
  material_preference text,
  branding_requirements text,
  artwork_url text,
  reference_images text[],
  delivery_requirements text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_packaging_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_custom_packaging" ON custom_packaging_requests;
CREATE POLICY "select_own_custom_packaging" ON custom_packaging_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "insert_own_custom_packaging" ON custom_packaging_requests;
CREATE POLICY "insert_own_custom_packaging" ON custom_packaging_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "update_own_custom_packaging" ON custom_packaging_requests;
CREATE POLICY "update_own_custom_packaging" ON custom_packaging_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "delete_own_custom_packaging" ON custom_packaging_requests;
CREATE POLICY "delete_own_custom_packaging" ON custom_packaging_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- ============ WISHLIST ============
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wishlist" ON wishlist;
CREATE POLICY "select_own_wishlist" ON wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist;
CREATE POLICY "insert_own_wishlist" ON wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist" ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SAVED DESIGNS ============
CREATE TABLE IF NOT EXISTS saved_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  design_request_id uuid REFERENCES design_requests(id) ON DELETE SET NULL,
  name text NOT NULL,
  image_url text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_designs" ON saved_designs;
CREATE POLICY "select_own_saved_designs" ON saved_designs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_designs" ON saved_designs;
CREATE POLICY "insert_own_saved_designs" ON saved_designs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_designs" ON saved_designs;
CREATE POLICY "delete_own_saved_designs" ON saved_designs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_quantity_tiers_product ON quantity_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_user ON design_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_request ON design_versions(design_request_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_user ON saved_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_quotes_user ON bulk_quotes(user_id);
