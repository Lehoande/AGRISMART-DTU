CREATE TABLE IF NOT EXISTS checkout_idempotency (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  idempotency_key VARCHAR(80) NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_checkout_user_key (user_id, idempotency_key),
  UNIQUE KEY uq_checkout_order (order_id),
  CONSTRAINT fk_checkout_idempotency_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_checkout_idempotency_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
