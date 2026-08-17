-- Enable pg_trgm extension for trigram similarity and indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a trigram GIN index on the concatenation of title and description
CREATE INDEX IF NOT EXISTS idx_products_title_description_trgm
  ON products USING gin ((title || ' ' || description) gin_trgm_ops);
