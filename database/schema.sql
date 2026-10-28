CREATE DATABASE IF NOT EXISTS agrismart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrismart;
CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 phone VARCHAR(30), address TEXT,
 role ENUM('customer','staff','manager','admin') NOT NULL DEFAULT 'customer',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
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
 shipping_address TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE IF NOT EXISTS browsing_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED,
 product_id BIGINT UNSIGNED NOT NULL, event_type ENUM('view','favorite','purchase') NOT NULL DEFAULT 'view',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
INSERT IGNORE INTO categories(name,slug) VALUES ('Rau củ','rau-cu'),('Trái cây','trai-cay'),('Gạo & ngũ cốc','gao-ngu-coc'),('Nông sản khác','nong-san-khac');
INSERT IGNORE INTO products(category_id,name,slug,description,price,unit,stock,origin,farmer_name,image_url,traceability_code) VALUES
(1,'Rau cải xanh hữu cơ','rau-cai-xanh','Rau xanh tươi, thu hoạch trong ngày.',28000,'kg',80,'Đà Lạt, Lâm Đồng','Hợp tác xã Xanh','https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800','AGR-VEG-0001'),
(2,'Cam sành miền Tây','cam-sanh','Cam mọng nước từ nhà vườn.',35000,'kg',120,'Vĩnh Long','Vườn Cam An Phú','https://images.unsplash.com/photo-1547514701-42782101795e?w=800','AGR-FRU-0002'),
(2,'Chuối cau tươi','chuoi-cau','Chuối cau chín tự nhiên.',22000,'kg',90,'Quảng Nam','Nông trại Bình An','https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800','AGR-FRU-0003'),
(3,'Gạo ST chất lượng cao','gao-st','Gạo thơm, hạt dài.',32000,'kg',200,'Sóc Trăng','HTX Lúa Sạch','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800','AGR-RIC-0004');
