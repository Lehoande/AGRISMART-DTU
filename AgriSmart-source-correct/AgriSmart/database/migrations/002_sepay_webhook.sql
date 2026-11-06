CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(24) NOT NULL,
  provider_event_id VARCHAR(100) NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  transaction_reference VARCHAR(120) NULL,
  transfer_amount DECIMAL(14,2) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  payload JSON NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  UNIQUE KEY uq_payment_webhook_provider_event (provider, provider_event_id),
  INDEX idx_payment_webhook_order_status (order_id, status),
  CONSTRAINT fk_payment_webhook_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);
