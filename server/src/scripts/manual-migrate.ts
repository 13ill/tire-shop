import { db } from '../db';
import { sql } from 'drizzle-orm';

async function manualMigrate() {
  console.log('🔄 Running manual migrations...');
  
  try {
    // Add product_groups table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_groups (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku_prefix VARCHAR(10),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ product_groups table created/verified');

    // Add new columns to products table
    const addGroupId = await db.execute(sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS group_id VARCHAR(36)
    `);
    console.log('✅ group_id column added');

    const addVariantName = await db.execute(sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255)
    `);
    console.log('✅ variant_name column added');

    // Rename and add new columns
    const addStock = await db.execute(sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS stock DECIMAL(12,2) DEFAULT 0
    `);
    console.log('✅ stock column added');

    // Check if basePrice exists and rename it to price
    try {
      await db.execute(sql`
        ALTER TABLE products 
        CHANGE COLUMN base_price price DECIMAL(12,2)
      `);
      console.log('✅ base_price renamed to price');
    } catch (error) {
      // Column might not exist or already renamed
      console.log('ℹ️ base_price column already handled');
    }

    // Add indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_group_id ON products(group_id)
    `);
    console.log('✅ group_id index added');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_variant_name ON products(variant_name)
    `);
    console.log('✅ variant_name index added');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_name ON product_groups(name)
    `);
    console.log('✅ product_groups name index added');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_sku_prefix ON product_groups(sku_prefix)
    `);
    console.log('✅ product_groups sku_prefix index added');

    console.log('🎉 Manual migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

manualMigrate();
