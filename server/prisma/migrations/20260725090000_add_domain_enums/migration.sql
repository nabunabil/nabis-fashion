-- Normalize legacy strings before converting them to constrained PostgreSQL enums.
-- Unknown legacy values fall back to the safest applicable state.
CREATE TYPE "UserRole" AS ENUM ('admin', 'customer');
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'STRIPE');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');
CREATE TYPE "PaymentTransactionType" AS ENUM ('PAYMENT', 'REFUND');
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('pending', 'succeeded', 'failed', 'canceled');
CREATE TYPE "InventoryMovementReason" AS ENUM (
  'INITIAL_STOCK', 'ADMIN_ADJUSTMENT', 'COD_ORDER', 'STRIPE_RESERVATION',
  'STRIPE_CHECKOUT_CREATION_FAILED', 'STRIPE_PAYMENT_FAILED', 'STRIPE_REFUND',
  'CUSTOMER_CANCELLATION', 'ADMIN_CANCELLATION'
);

UPDATE "users"
SET "role" = CASE WHEN lower("role") = 'admin' THEN 'admin' ELSE 'customer' END;
UPDATE "users"
SET "status" = CASE WHEN lower(COALESCE("status", 'active')) = 'suspended' THEN 'suspended' ELSE 'active' END;

UPDATE "orders"
SET "order_status" = CASE lower("order_status")
  WHEN 'confirmed' THEN 'confirmed' WHEN 'processing' THEN 'processing'
  WHEN 'shipped' THEN 'shipped' WHEN 'delivered' THEN 'delivered'
  WHEN 'cancelled' THEN 'cancelled' ELSE 'pending' END,
    "payment_method" = CASE upper("payment_method") WHEN 'STRIPE' THEN 'STRIPE' ELSE 'COD' END,
    "payment_status" = CASE lower("payment_status")
      WHEN 'paid' THEN 'paid' WHEN 'failed' THEN 'failed' WHEN 'refunded' THEN 'refunded'
      WHEN 'partially_refunded' THEN 'partially_refunded' ELSE 'pending' END;

UPDATE "payment_transactions"
SET "provider" = 'STRIPE',
    "type" = CASE upper("type") WHEN 'REFUND' THEN 'REFUND' ELSE 'PAYMENT' END,
    "status" = CASE lower("status")
      WHEN 'succeeded' THEN 'succeeded' WHEN 'failed' THEN 'failed'
      WHEN 'canceled' THEN 'canceled' ELSE 'pending' END;

UPDATE "inventory_movements"
SET "reason" = CASE upper("reason")
  WHEN 'INITIAL_STOCK' THEN 'INITIAL_STOCK' WHEN 'ADMIN_ADJUSTMENT' THEN 'ADMIN_ADJUSTMENT'
  WHEN 'COD_ORDER' THEN 'COD_ORDER' WHEN 'STRIPE_RESERVATION' THEN 'STRIPE_RESERVATION'
  WHEN 'STRIPE_CHECKOUT_CREATION_FAILED' THEN 'STRIPE_CHECKOUT_CREATION_FAILED'
  WHEN 'STRIPE_PAYMENT_FAILED' THEN 'STRIPE_PAYMENT_FAILED' WHEN 'STRIPE_REFUND' THEN 'STRIPE_REFUND'
  WHEN 'CUSTOMER_CANCELLATION' THEN 'CUSTOMER_CANCELLATION'
  WHEN 'ADMIN_CANCELLATION' THEN 'ADMIN_CANCELLATION' ELSE 'ADMIN_ADJUSTMENT' END;

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole",
  ALTER COLUMN "role" SET DEFAULT 'customer',
  ALTER COLUMN "status" TYPE "UserStatus" USING "status"::"UserStatus",
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'active';

ALTER TABLE "orders"
  ALTER COLUMN "order_status" TYPE "OrderStatus" USING "order_status"::"OrderStatus",
  ALTER COLUMN "payment_method" TYPE "PaymentMethod" USING "payment_method"::"PaymentMethod",
  ALTER COLUMN "payment_status" TYPE "PaymentStatus" USING "payment_status"::"PaymentStatus";

ALTER TABLE "payment_transactions"
  ALTER COLUMN "provider" TYPE "PaymentProvider" USING "provider"::"PaymentProvider",
  ALTER COLUMN "type" TYPE "PaymentTransactionType" USING "type"::"PaymentTransactionType",
  ALTER COLUMN "status" TYPE "PaymentTransactionStatus" USING "status"::"PaymentTransactionStatus";

ALTER TABLE "inventory_movements"
  ALTER COLUMN "reason" TYPE "InventoryMovementReason" USING "reason"::"InventoryMovementReason";
