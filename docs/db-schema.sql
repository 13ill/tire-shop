-- =============================================
-- POS+Stock ร้านยาง — Database Schema (MySQL/MariaDB)
-- Created: 2026-05-29
-- ORM: Drizzle (จะ generate จาก schema.ts แต่นี่คือ reference)
-- =============================================

-- =============================================
-- AUTH & SETTINGS
-- =============================================

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role ENUM('owner', 'staff') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE payment_methods (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  surcharge_percent DECIMAL(5,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  sort_order INT DEFAULT 0
);

CREATE TABLE units (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- =============================================
-- PRODUCTS & SERVICES
-- =============================================

CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('product', 'service') NOT NULL,
  parent_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('product', 'service') NOT NULL,
  has_variants BOOLEAN DEFAULT FALSE,
  has_labor_cost BOOLEAN DEFAULT FALSE,
  base_price DECIMAL(12,2),
  labor_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),               -- ราคาทุน
  cost_method ENUM('fifo', 'average', 'manual') DEFAULT 'average',
  unit_id VARCHAR(36),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  min_stock DECIMAL(12,2) DEFAULT 0,
  alert_enabled BOOLEAN DEFAULT TRUE,     -- Low stock alert (ignore = FALSE)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE product_variants (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,             -- e.g., "195/65R15"
  sku VARCHAR(100),
  barcode VARCHAR(100),
  cost_price DECIMAL(12,2),
  additional_price DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE pricing_tiers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,             -- "ปลีก", "ส่ง", "VIP"
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_prices (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36),
  tier_id VARCHAR(36) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (tier_id) REFERENCES pricing_tiers(id)
);

-- =============================================
-- SUPPLIERS & PROCUREMENT
-- =============================================

CREATE TABLE suppliers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  note TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  supplier_id VARCHAR(36) NOT NULL,
  po_number VARCHAR(50),
  status ENUM('draft', 'ordered', 'partial', 'received', 'cancelled') DEFAULT 'draft',
  total DECIMAL(12,2),
  note TEXT,
  ordered_at TIMESTAMP,
  received_at TIMESTAMP,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE purchase_order_items (
  id VARCHAR(36) PRIMARY KEY,
  po_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36),
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(12,2) NOT NULL,
  received_qty DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- =============================================
-- STOCK
-- =============================================

CREATE TABLE stock_movements (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36),
  type ENUM('in', 'out', 'return', 'loss', 'damage', 'correction') NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  cost_at_time DECIMAL(12,2),             -- ราคาทุน ณ เวลาที่ move
  reference_type VARCHAR(50),             -- 'sale', 'job_pick', 'job_return', 'purchase', 'manual', 'count'
  reference_id VARCHAR(36),
  loss_reason TEXT,                       -- เหตุผล (เมื่อ type = loss/damage/correction)
  approved_by VARCHAR(36),                -- owner approve (สำหรับ loss/correction)
  note TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE stock_balances (
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36) NOT NULL DEFAULT '',
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, variant_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE stock_counts (
  id VARCHAR(36) PRIMARY KEY,
  status ENUM('draft', 'counting', 'reviewed', 'approved') DEFAULT 'draft',
  note TEXT,
  counted_by VARCHAR(36),
  approved_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (counted_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE stock_count_items (
  id VARCHAR(36) PRIMARY KEY,
  count_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36),
  system_qty DECIMAL(12,2) NOT NULL,      -- จำนวนในระบบ
  actual_qty DECIMAL(12,2),               -- จำนวนนับจริง
  difference DECIMAL(12,2),               -- ส่วนต่าง
  FOREIGN KEY (count_id) REFERENCES stock_counts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Storage locations (เผื่อไว้ — Phase 2)
CREATE TABLE storage_locations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('warehouse', 'zone', 'position') NOT NULL,
  parent_id VARCHAR(36),
  FOREIGN KEY (parent_id) REFERENCES storage_locations(id)
);

-- =============================================
-- CUSTOMERS & VEHICLES
-- =============================================

CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  phone2 VARCHAR(50),
  address TEXT,
  note TEXT,
  tier_id VARCHAR(36),
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES pricing_tiers(id)
);

CREATE TABLE vehicles (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36),
  license_plate VARCHAR(20),
  brand VARCHAR(100),
  model VARCHAR(100),
  color VARCHAR(50),
  tire_size VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =============================================
-- SERVICE JOBS (BOM movement-based)
-- =============================================

CREATE TABLE visits (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36),
  vehicle_id VARCHAR(36),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE jobs (
  id VARCHAR(36) PRIMARY KEY,
  visit_id VARCHAR(36),                   -- 1 visit มีหลาย jobs ได้
  customer_id VARCHAR(36),
  vehicle_id VARCHAR(36),
  status ENUM('queue', 'in_progress', 'testing', 'delivered', 'done', 'cancelled') DEFAULT 'queue',
  symptoms TEXT,
  diagnosis TEXT,
  note TEXT,
  assigned_to VARCHAR(255),
  estimated_price DECIMAL(12,2),          -- ประมาณการ
  final_price DECIMAL(12,2),              -- ค่าจริง
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- BOM: movement-based (เบิก/คืน real-time)
CREATE TABLE job_bom_movements (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36),
  variant_id VARCHAR(36),
  type ENUM('pick', 'return', 'service') NOT NULL, -- pick=เบิก, return=คืน, service=บริการ
  quantity DECIMAL(12,2) NOT NULL,
  reason TEXT,                            -- เหตุผล (บังคับเมื่อเพิ่ม/คืนระหว่างทำ)
  picked_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (picked_by) REFERENCES users(id)
);

-- ราคา (คำนวณโดยพนักงานเคาท์เตอร์)
CREATE TABLE job_billing (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  bom_movement_id VARCHAR(36),
  description TEXT,                       -- custom item ที่ไม่ผูก BOM
  unit_price DECIMAL(12,2) NOT NULL,
  labor_price DECIMAL(12,2) DEFAULT 0,
  quantity DECIMAL(12,2) DEFAULT 1,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  priced_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (bom_movement_id) REFERENCES job_bom_movements(id),
  FOREIGN KEY (priced_by) REFERENCES users(id)
);

-- =============================================
-- PHOTOS
-- =============================================

CREATE TABLE photos (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  stage ENUM('before', 'during', 'after') NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  description TEXT,
  sort_order INT DEFAULT 0,
  synced BOOLEAN DEFAULT FALSE,
  remote_url VARCHAR(500),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- WARRANTY
-- =============================================

CREATE TABLE warranties (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  bom_movement_id VARCHAR(36),
  description VARCHAR(255),
  duration_days INT NOT NULL,
  price DECIMAL(12,2) DEFAULT 0,
  included_in_price BOOLEAN DEFAULT FALSE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT,
  status ENUM('active', 'claimed', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (bom_movement_id) REFERENCES job_bom_movements(id)
);

-- =============================================
-- POS / SALES
-- =============================================

CREATE TABLE shifts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  opening_cash DECIMAL(12,2) NOT NULL,    -- เงินทอนตอนเปิดกะ
  closing_cash DECIMAL(12,2),             -- เงินในลิ้นชักตอนปิด
  expected_cash DECIMAL(12,2),            -- เงินที่ควรมี (คำนวณ)
  difference DECIMAL(12,2),               -- ส่วนต่าง
  status ENUM('open', 'closed') DEFAULT 'open',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  note TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sales (
  id VARCHAR(36) PRIMARY KEY,
  shift_id VARCHAR(36),
  customer_id VARCHAR(36),
  job_id VARCHAR(36),
  sale_number VARCHAR(50),                -- เลขที่บิล (auto-gen)
  doc_type ENUM('receipt', 'tax_invoice', 'delivery_note') DEFAULT 'receipt',
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  vat_percent DECIMAL(5,2) DEFAULT 0,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) DEFAULT 0, -- เงินมัดจำ
  payment_status ENUM('pending', 'partial', 'paid', 'voided', 'refunded') DEFAULT 'pending',
  voided_reason TEXT,
  note TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE sale_items (
  id VARCHAR(36) PRIMARY KEY,
  sale_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36),
  variant_id VARCHAR(36),
  description VARCHAR(255),
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  labor_price DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  sale_id VARCHAR(36) NOT NULL,
  method_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference VARCHAR(255),                 -- เลขอ้างอิง/slip
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (method_id) REFERENCES payment_methods(id)
);

-- Hold/Park bills
CREATE TABLE held_sales (
  id VARCHAR(36) PRIMARY KEY,
  shift_id VARCHAR(36),
  customer_id VARCHAR(36),
  items_json TEXT NOT NULL,               -- JSON snapshot ของ items
  note TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- EXPENSES (รายจ่ายร้าน)
-- =============================================

CREATE TABLE expense_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL              -- ค่าน้ำ, ค่าไฟ, เงินเดือน, อื่นๆ
);

CREATE TABLE expenses (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  receipt_photo VARCHAR(500),             -- รูปใบเสร็จ
  expense_date DATE NOT NULL,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- LOYALTY (สะสมแต้ม)
-- =============================================

CREATE TABLE loyalty_rules (
  id VARCHAR(36) PRIMARY KEY,
  points_per_baht DECIMAL(5,2) DEFAULT 1, -- ทุก X บาท ได้ 1 แต้ม
  redeem_rate DECIMAL(5,2) DEFAULT 1,     -- 1 แต้ม = X บาท
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE loyalty_transactions (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  type ENUM('earn', 'redeem', 'adjust') NOT NULL,
  points INT NOT NULL,
  reference_type VARCHAR(50),             -- 'sale', 'manual'
  reference_id VARCHAR(36),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =============================================
-- TIME ATTENDANCE (เข้างาน-ออกงาน)
-- =============================================

CREATE TABLE attendance (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  note TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- FOLLOW-UP (แจ้งเตือนหลังซ่อม)
-- =============================================

CREATE TABLE follow_ups (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36),
  follow_up_date DATE NOT NULL,
  type ENUM('warranty_check', 'service_reminder', 'custom') DEFAULT 'custom',
  message TEXT,
  status ENUM('pending', 'done', 'skipped') DEFAULT 'pending',
  completed_at TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =============================================
-- SYNC (offline queue tracking)
-- =============================================

CREATE TABLE sync_log (
  id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,            -- 'create', 'update', 'delete'
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(36) NOT NULL,
  payload JSON,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT LOG (ใครทำอะไร เมื่อไร)
-- =============================================

CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(36),
  old_value JSON,
  new_value JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
