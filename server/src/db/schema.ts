import { 
  varchar, 
  boolean, 
  timestamp, 
  decimal, 
  int, 
  text, 
  mysqlEnum, 
  index
} from 'drizzle-orm/mysql-core';
import { mysqlTable } from 'drizzle-orm/mysql-core';
import { v4 as uuidv4 } from 'uuid';

// =============================================
// AUTH & SETTINGS
// =============================================

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull().$defaultFn(() => ''),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['owner', 'staff']).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  usernameIdx: index('username_idx').on(table.username),
}));

export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  description: varchar('description', { length: 255 }),
});

export const paymentMethods = mysqlTable('payment_methods', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  surchargePercent: decimal('surcharge_percent', { precision: 5, scale: 2 }).default('0'),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  sortOrder: int('sort_order').default(0),
});

export const units = mysqlTable('units', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 50 }).notNull(),
  isDefault: boolean('is_default').default(false),
});

// =============================================
// PRODUCTS & SERVICES
// =============================================

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 255 }).notNull(),
  type: mysqlEnum('type', ['product', 'service']).notNull(),
  parentId: varchar('parent_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  parentIdx: index('parent_idx').on(table.parentId),
}));

export const productGroups = mysqlTable('product_groups', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  skuPrefix: varchar('sku_prefix', { length: 10 }), // BS for Bridgestone
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
  skuPrefixIdx: index('sku_prefix_idx').on(table.skuPrefix),
}));

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  groupId: varchar('group_id', { length: 36 }), // อ้างอิง group
  categoryId: varchar('category_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(), // Full name: "ยาง Bridgestone 195/65R15"
  variantName: varchar('variant_name', { length: 255 }), // "195/65R15"
  description: text('description'),
  type: mysqlEnum('type', ['product', 'service']).notNull(),
  hasLaborCost: boolean('has_labor_cost').default(false),
  price: decimal('price', { precision: 12, scale: 2 }), // ราคาขาย (รวมทุกอย่าง)
  laborPrice: decimal('labor_price', { precision: 12, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  costMethod: mysqlEnum('cost_method', ['fifo', 'average', 'manual']).default('average'),
  unitId: varchar('unit_id', { length: 36 }),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  stock: decimal('stock', { precision: 12, scale: 2 }).default('0'),
  minStock: decimal('min_stock', { precision: 12, scale: 2 }).default('0'),
  alertEnabled: boolean('alert_enabled').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  groupIdx: index('group_idx').on(table.groupId),
  categoryIdx: index('category_idx').on(table.categoryId),
  skuIdx: index('sku_idx').on(table.sku),
  barcodeIdx: index('barcode_idx').on(table.barcode),
  variantIdx: index('variant_idx').on(table.variantName),
}));

export const customers = mysqlTable('customers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  province: varchar('province', { length: 100 }),
  district: varchar('district', { length: 100 }),
  subdistrict: varchar('subdistrict', { length: 100 }),
  zipcode: varchar('zipcode', { length: 10 }),
  taxId: varchar('tax_id', { length: 20 }),
  note: text('note'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
  phoneIdx: index('phone_idx').on(table.phone),
  emailIdx: index('email_idx').on(table.email),
}));

export const vehicles = mysqlTable('vehicles', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  customerId: varchar('customer_id', { length: 36 }).notNull(),
  brandId: varchar('brand_id', { length: 36 }),
  modelId: varchar('model_id', { length: 36 }),
  brandCustom: varchar('brand_custom', { length: 100 }),
  modelCustom: varchar('model_custom', { length: 100 }),
  year: varchar('year', { length: 4 }),
  color: varchar('color', { length: 50 }),
  licensePlate: varchar('license_plate', { length: 20 }),
  vin: varchar('vin', { length: 50 }),
  engineNumber: varchar('engine_number', { length: 50 }),
  mileage: decimal('mileage', { precision: 10, scale: 2 }),
  note: text('note'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  customerIdx: index('customer_idx').on(table.customerId),
  licensePlateIdx: index('license_plate_idx').on(table.licensePlate),
  vinIdx: index('vin_idx').on(table.vin),
  brandIdx: index('vehicle_brand_idx').on(table.brandId),
  modelIdx: index('vehicle_model_idx').on(table.modelId),
}));

export const vehicleBrands = mysqlTable('vehicle_brands', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 100 }).notNull(),
  country: varchar('country', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  nameIdx: index('brand_idx').on(table.name),
}));

export const vehicleModels = mysqlTable('vehicle_models', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  brandId: varchar('brand_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  brandModelIdx: index('brand_model_idx').on(table.brandId),
}));

export const pricingTiers = mysqlTable('pricing_tiers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
});

// =============================================
// POS & TRANSACTIONS
// =============================================

export const sales = mysqlTable('sales', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  customerId: varchar('customer_id', { length: 36 }),
  vehicleId: varchar('vehicle_id', { length: 36 }),
  userId: varchar('user_id', { length: 36 }).notNull(),
  saleDate: timestamp('sale_date').defaultNow(),
  status: mysqlEnum('status', ['draft', 'confirmed', 'paid', 'cancelled']).default('draft'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0'),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
  changeAmount: decimal('change_amount', { precision: 12, scale: 2 }).default('0'),
  paymentMethodId: varchar('payment_method_id', { length: 36 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  customerIdx: index('sale_customer_idx').on(table.customerId),
  vehicleIdx: index('sale_vehicle_idx').on(table.vehicleId),
  userIdx: index('sale_user_idx').on(table.userId),
  saleDateIdx: index('sale_date_idx').on(table.saleDate),
  statusIdx: index('sale_status_idx').on(table.status),
}));

export const saleItems = mysqlTable('sale_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  saleId: varchar('sale_id', { length: 36 }).notNull(),
  productId: varchar('product_id', { length: 36 }).notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  saleIdx: index('sale_item_sale_idx').on(table.saleId),
  productIdx: index('sale_item_product_idx').on(table.productId),
}));

export const stockMovements = mysqlTable('stock_movements', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  productId: varchar('product_id', { length: 36 }).notNull(),
  movementType: mysqlEnum('movement_type', ['in', 'out', 'return', 'loss', 'adjust']).notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  referenceId: varchar('reference_id', { length: 36 }),
  referenceType: mysqlEnum('reference_type', ['sale', 'purchase', 'adjustment', 'return', 'loss']).notNull(),
  note: text('note'),
  userId: varchar('user_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productIdx: index('stock_product_idx').on(table.productId),
  movementTypeIdx: index('stock_movement_type_idx').on(table.movementType),
  referenceIdx: index('stock_reference_idx').on(table.referenceId),
  createdAtIdx: index('stock_created_at_idx').on(table.createdAt),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type ProductGroup = typeof productGroups.$inferSelect;
export type NewProductGroup = typeof productGroups.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type PricingTier = typeof pricingTiers.$inferSelect;
export type NewPricingTier = typeof pricingTiers.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
