CREATE DATABASE IF NOT EXISTS agrismart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrismart;
CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 avatar_url TEXT NULL,
 two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE, two_factor_secret TEXT NULL,
 two_factor_pending_secret TEXT NULL, two_factor_pending_at DATETIME NULL,
 phone VARCHAR(30), address TEXT, ward VARCHAR(120), district VARCHAR(120), province VARCHAR(120),
 role ENUM('customer','seller','staff','manager','admin') NOT NULL DEFAULT 'customer',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS seller_profiles (
 user_id BIGINT UNSIGNED PRIMARY KEY, farm_name VARCHAR(180) NOT NULL, farm_address VARCHAR(500) NOT NULL,
 status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
 reviewed_at DATETIME NULL, reviewed_by BIGINT UNSIGNED NULL, review_note VARCHAR(1000) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS categories (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE,
 slug VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS products (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id BIGINT UNSIGNED,
 name VARCHAR(180) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE, description TEXT,
 price DECIMAL(12,2) NOT NULL DEFAULT 0, unit VARCHAR(40) NOT NULL DEFAULT 'kg',
 stock INT NOT NULL DEFAULT 0, origin VARCHAR(160), farmer_name VARCHAR(160),
 image_url TEXT, traceability_code VARCHAR(100) UNIQUE, is_active BOOLEAN NOT NULL DEFAULT TRUE,
 seller_id BIGINT UNSIGNED NULL, certification VARCHAR(80), region VARCHAR(120), harvest_date DATE, storage_condition VARCHAR(255),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
 FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS cart_items (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NOT NULL, quantity INT NOT NULL DEFAULT 1,
 UNIQUE KEY uq_cart_user_product(user_id,product_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orders (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 total DECIMAL(12,2) NOT NULL,
 status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
 shipping_name VARCHAR(120) NOT NULL, shipping_phone VARCHAR(30) NOT NULL,
 shipping_address TEXT NOT NULL, shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
 payment_method ENUM('cod','card','vnpay','momo','banking') NOT NULL DEFAULT 'cod',
 payment_status ENUM('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid', payment_ref VARCHAR(60) NULL,
 bank_transfer_claimed_at DATETIME NULL,
 discount_code VARCHAR(40) NULL, discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS order_items (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NOT NULL, product_name VARCHAR(180) NOT NULL,
 unit_price DECIMAL(12,2) NOT NULL, quantity INT NOT NULL,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS reviews (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NOT NULL, rating TINYINT UNSIGNED NOT NULL, comment TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_review_user_product(user_id,product_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE, CHECK(rating BETWEEN 1 AND 5)
);
CREATE TABLE IF NOT EXISTS promotions (
 code VARCHAR(40) PRIMARY KEY, discount_percent DECIMAL(5,2) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE, starts_at DATETIME NULL, ends_at DATETIME NULL,
 max_uses INT NULL, use_count INT NOT NULL DEFAULT 0,
 CHECK(discount_percent > 0 AND discount_percent <= 100)
);
CREATE TABLE IF NOT EXISTS complaints (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 order_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NULL,
 issue_type VARCHAR(80) NOT NULL, description TEXT NOT NULL, evidence_url TEXT NULL,
 status ENUM('submitted','investigating','resolved','rejected','undetermined') NOT NULL DEFAULT 'submitted',
 staff_note TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS browsing_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED,
 product_id BIGINT UNSIGNED NOT NULL, event_type ENUM('view','favorite','purchase') NOT NULL DEFAULT 'view',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
INSERT IGNORE INTO categories(name,slug) VALUES ('Rau củ','rau-cu'),('Trái cây','trai-cay'),('Gạo & ngũ cốc','gao-ngu-coc'),('Nông sản khác','nong-san-khac');
