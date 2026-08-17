-- Add UK-specific address fields to orders table
ALTER TABLE orders
  ADD COLUMN county TEXT,
  ADD COLUMN country TEXT DEFAULT 'UK',
  ADD COLUMN is_inside_city BOOLEAN DEFAULT true,
  ADD COLUMN delivery_instructions TEXT;

-- Note: postal_code column already exists; ensure no duplicate additions
