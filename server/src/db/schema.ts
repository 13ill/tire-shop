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

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  categoryId: varchar('category_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: mysqlEnum('type', ['product', 'service']).notNull(),
  hasVariants: boolean('has_variants').default(false),
  hasLaborCost: boolean('has_labor_cost').default(false),
  basePrice: decimal('base_price', { precision: 12, scale: 2 }),
  laborPrice: decimal('labor_price', { precision: 12, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  costMethod: mysqlEnum('cost_method', ['fifo', 'average', 'manual']).default('average'),
  unitId: varchar('unit_id', { length: 36 }),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  minStock: decimal('min_stock', { precision: 12, scale: 2 }).default('0'),
  alertEnabled: boolean('alert_enabled').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.categoryId),
  skuIdx: index('sku_idx').on(table.sku),
  barcodeIdx: index('barcode_idx').on(table.barcode),
}));

export const pricingTiers = mysqlTable('pricing_tiers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
