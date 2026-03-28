CREATE DATABASE IF NOT EXISTS rkl_trove;
USE rkl_trove;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: We use IGNORE or ON DUPLICATE KEY to avoid inserting duplicates if script is run multiple times
-- Since name is not UNIQUE, we will just delete all products and re-insert for clean state
TRUNCATE TABLE products;

INSERT INTO products (name, price, image_url, description) VALUES
('Ocean Waves Resin Coaster Set', 899.00, 'https://images.unsplash.com/photo-1601804256636-601d7ed08d17?q=80&w=600&auto=format&fit=crop', 'Set of 4 beautiful ocean-inspired resin coasters. Handcrafted with premium epoxy resin.'),
('Geode Resin Wall Art', 4500.00, 'https://images.unsplash.com/photo-1615526685124-c13f9acc09a8?q=80&w=600&auto=format&fit=crop', 'Stunning amethyst geode resin wall art with authentic gold flakes. Perfect for your luxurious living room.'),
('Floral Resin Keychains', 299.00, 'https://images.unsplash.com/photo-1596462700812-32b03fb52e82?q=80&w=600&auto=format&fit=crop', 'Cute and highly durable resin keychains embedding real pressed dried flowers.'),
('Emerald Green Resin Tray', 1299.00, 'https://images.unsplash.com/photo-1595166668700-1127dcc343bb?q=80&w=600&auto=format&fit=crop', 'Elegant emerald green serving tray with premium golden handles. A masterpiece for any dining setting.'),
('Galaxy Resin Jewelry Box', 749.00, 'https://images.unsplash.com/photo-1613262657388-75c1a7a00fdb?q=80&w=600&auto=format&fit=crop', 'Celestial themed resin jewelry box with shimmering blue and purple cosmic hues.'),
('Rose Gold Flake Earrings', 399.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', 'Delicate dangle earrings made of clear UV resin and luxurious rose gold flakes.'),
('Personalized Resin Bookmark', 199.00, 'https://images.unsplash.com/photo-1611105421060-cfcb85c1ebbc?q=80&w=600&auto=format&fit=crop', 'Customized name bookmark embedded with real gold flakes and matching tassels.'),
('Amethyst Chunk Night Light', 1599.00, 'https://images.unsplash.com/photo-1558239088-7a56fb2ce834?q=80&w=600&auto=format&fit=crop', 'Gorgeous resin night light resembling a glowing raw amethyst crystal chunk.');

-- Password reset OTPs
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favourites
CREATE TABLE IF NOT EXISTS favourites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fav (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
