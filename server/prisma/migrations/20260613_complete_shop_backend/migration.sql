-- Reconcile address fields from the earlier migration.
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "county" TEXT,
  ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'Bangladesh';
ALTER TABLE "orders" ALTER COLUMN "country" SET DEFAULT 'Bangladesh';

-- Preserve one cart per user and merge duplicate cart items before constraints.
CREATE TEMP TABLE merged_cart_items ON COMMIT DROP AS
WITH ranked_carts AS (
  SELECT id, user_id, MIN(id) OVER (PARTITION BY user_id) AS keep_id
  FROM carts
)
SELECT rc.keep_id AS cart_id, ci.product_variant_id, SUM(ci.quantity)::INTEGER AS quantity
FROM cart_items ci
JOIN ranked_carts rc ON rc.id = ci.cart_id
GROUP BY rc.keep_id, ci.product_variant_id;

DELETE FROM cart_items;

WITH ranked_carts AS (
  SELECT id, user_id, MIN(id) OVER (PARTITION BY user_id) AS keep_id
  FROM carts
)
DELETE FROM carts
WHERE id IN (SELECT id FROM ranked_carts WHERE id <> keep_id);

INSERT INTO cart_items (cart_id, product_variant_id, quantity)
SELECT cart_id, product_variant_id, quantity
FROM merged_cart_items;

-- Keep the newest review when legacy data has duplicates.
DELETE FROM reviews older
USING reviews newer
WHERE older.user_id = newer.user_id
  AND older.product_id = newer.product_id
  AND older.id < newer.id;

ALTER TABLE "product_variants" ADD COLUMN "sku" TEXT;
UPDATE "product_variants" SET "sku" = 'SKU-' || id WHERE "sku" IS NULL;
ALTER TABLE "product_variants" ALTER COLUMN "sku" SET NOT NULL;

ALTER TABLE "orders"
  ADD COLUMN "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "discount_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "delivery_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "stripe_checkout_session" TEXT,
  ADD COLUMN "inventory_restored_at" TIMESTAMP(3),
  ADD COLUMN "cancelled_at" TIMESTAMP(3),
  ADD COLUMN "refunded_at" TIMESTAMP(3),
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "orders"
SET "subtotal" = "total_price"
WHERE "subtotal" = 0;

ALTER TABLE "order_items"
  ADD COLUMN "product_title" TEXT,
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "size" TEXT,
  ADD COLUMN "color" TEXT;

UPDATE "order_items" oi
SET
  "product_title" = p.title,
  "sku" = pv.sku,
  "size" = pv.size,
  "color" = pv.color
FROM "product_variants" pv
JOIN "products" p ON p.id = pv.product_id
WHERE oi.product_variant_id = pv.id;

ALTER TABLE "order_items"
  ALTER COLUMN "product_title" SET NOT NULL,
  ALTER COLUMN "sku" SET NOT NULL,
  ALTER COLUMN "size" SET NOT NULL,
  ALTER COLUMN "color" SET NOT NULL;

CREATE TABLE "payment_transactions" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "provider" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "currency" TEXT NOT NULL,
  "provider_reference" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_transactions_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "webhook_events" (
  "id" SERIAL PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "inventory_movements" (
  "id" SERIAL PRIMARY KEY,
  "product_variant_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "quantity" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_movements_product_variant_id_fkey"
    FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE UNIQUE INDEX "product_variants_product_id_size_color_key"
  ON "product_variants"("product_id", "size", "color");
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");
CREATE UNIQUE INDEX "cart_items_cart_id_product_variant_id_key"
  ON "cart_items"("cart_id", "product_variant_id");
CREATE UNIQUE INDEX "reviews_user_id_product_id_key"
  ON "reviews"("user_id", "product_id");
CREATE UNIQUE INDEX "orders_stripe_payment_intent_key"
  ON "orders"("stripe_payment_intent");
CREATE UNIQUE INDEX "orders_stripe_checkout_session_key"
  ON "orders"("stripe_checkout_session");
CREATE UNIQUE INDEX "payment_transactions_provider_reference_key"
  ON "payment_transactions"("provider_reference");
CREATE UNIQUE INDEX "webhook_events_provider_event_id_key"
  ON "webhook_events"("provider", "event_id");

CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");
CREATE INDEX "payment_transactions_order_id_created_at_idx"
  ON "payment_transactions"("order_id", "created_at");
CREATE INDEX "inventory_movements_product_variant_id_created_at_idx"
  ON "inventory_movements"("product_variant_id", "created_at");
CREATE INDEX "inventory_movements_order_id_idx" ON "inventory_movements"("order_id");

ALTER TABLE "product_variants"
  DROP CONSTRAINT IF EXISTS "product_variants_product_id_fkey",
  ADD CONSTRAINT "product_variants_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_images"
  DROP CONSTRAINT IF EXISTS "product_images_product_id_fkey",
  ADD CONSTRAINT "product_images_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "carts"
  DROP CONSTRAINT IF EXISTS "carts_user_id_fkey",
  ADD CONSTRAINT "carts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cart_items"
  DROP CONSTRAINT IF EXISTS "cart_items_cart_id_fkey",
  ADD CONSTRAINT "cart_items_cart_id_fkey"
    FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items"
  DROP CONSTRAINT IF EXISTS "order_items_order_id_fkey",
  ADD CONSTRAINT "order_items_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews"
  DROP CONSTRAINT IF EXISTS "reviews_user_id_fkey",
  ADD CONSTRAINT "reviews_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  DROP CONSTRAINT IF EXISTS "reviews_product_id_fkey",
  ADD CONSTRAINT "reviews_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
