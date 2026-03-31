-- RKL Trove Product Schema
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  price       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  image_url   TEXT,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safety scripts (runs only if columns are missing or need modification)
ALTER TABLE products
  MODIFY COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE products
  MODIFY COLUMN description TEXT;

-- Initial Database Seeding
-- We use TRUNCATE for a clean state during development (optional, but requested for fix)
-- TRUNCATE TABLE products;

INSERT INTO products (name, price, image_url, description) VALUES
  ('Resin Coaster Set',    499.00,  '/images/product_2.jpg',
   'Beautiful handcrafted resin coasters with floral patterns'),
  ('Resin Keychain',       199.00,  '/images/product_3.jpg',
   'Cute personalized resin keychains available in multiple colors'),
  ('Resin Wall Clock',    1299.00,  '/images/product_11.jpg',
   'Elegant resin wall clock with gold foil detailing'),
  ('Resin Tray',           899.00,  '/images/product_14.jpg',
   'Decorative resin serving tray perfect for home decor'),
  ('Resin Earrings',       349.00,  '/images/product_7.jpg',
   'Lightweight handmade resin earrings with dried flower inclusions'),
  ('Resin Photo Frame',    649.00,  '/images/product_16.jpg',
   'Custom resin photo frame with glitter and pearl finish');
