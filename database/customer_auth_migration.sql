USE srinidhi_constructions;

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_created_at (created_at)
);

SET @customers_has_name = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'name'
);
SET @customers_has_full_name = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'full_name'
);
SET @customer_name_migration = IF(
  @customers_has_name > 0 AND @customers_has_full_name = 0,
  'ALTER TABLE customers CHANGE COLUMN name full_name VARCHAR(120) NOT NULL',
  'SELECT 1'
);
PREPARE customer_name_statement FROM @customer_name_migration;
EXECUTE customer_name_statement;
DEALLOCATE PREPARE customer_name_statement;
