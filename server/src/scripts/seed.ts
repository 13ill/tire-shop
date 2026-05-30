import { db } from '../db';
import { users, settings, paymentMethods, units, categories, pricingTiers } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create default owner user
    const existingOwner = await db
      .select()
      .from(users)
      .where(eq(users.username, 'owner'))
      .limit(1);

    if (existingOwner.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await db.insert(users).values({
        id: crypto.randomUUID(),
        username: 'owner',
        passwordHash: hashedPassword,
        displayName: 'เจ้าของร้าน',
        role: 'owner',
        isActive: true,
        createdAt: new Date(),
      });
      console.log('✅ Created default owner user (username: owner, password: admin123)');
    }

    // 2. Create default settings
    const defaultSettings = [
      { key: 'shop_name', value: 'ร้านยางของฉัน', description: 'ชื่อร้าน' },
      { key: 'shop_address', value: '123 ถนนสายหลัก ตำบลในเมือง จังหวัดของคุณ', description: 'ที่อยู่ร้าน' },
      { key: 'shop_phone', value: '02-123-4567', description: 'เบอร์โทรศัพท์ร้าน' },
      { key: 'vat_percent', value: '7', description: 'อัตราภาษีมูลค่าเพิ่ม (%)' },
      { key: 'currency_symbol', value: '฿', description: 'สัญลักษณ์สกุลเงิน' },
      { key: 'decimal_places', value: '2', description: 'จำนวนทศนิยม' },
      { key: 'low_stock_alert', value: 'true', description: 'แจ้งเตือนสต็อกต่ำ' },
      { key: 'receipt_header', value: 'ใบเสร็จรับเงิน', description: 'หัวใบเสร็จ' },
      { key: 'receipt_footer', value: 'ขอบคุณที่ใช้บริการ', description: 'ท้ายใบเสร็จ' },
    ];

    for (const setting of defaultSettings) {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, setting.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(settings).values(setting);
      }
    }
    console.log('✅ Created default settings');

    // 3. Create payment methods
    const defaultPaymentMethods = [
      { name: 'เงินสด', surchargePercent: '0', discountPercent: '0', sortOrder: 1 },
      { name: 'โอนเงิน', surchargePercent: '0', discountPercent: '0', sortOrder: 2 },
      { name: 'บัตรเครดิต', surchargePercent: '2', discountPercent: '0', sortOrder: 3 },
      { name: 'พร้อมเพย์', surchargePercent: '0', discountPercent: '0', sortOrder: 4 },
      { name: 'เครดิตร้าน', surchargePercent: '0', discountPercent: '0', sortOrder: 5 },
    ];

    for (const method of defaultPaymentMethods) {
      const existing = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.name, method.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(paymentMethods).values({
          id: crypto.randomUUID(),
          ...method,
          isActive: true,
        });
      }
    }
    console.log('✅ Created default payment methods');

    // 4. Create units
    const defaultUnits = [
      { name: 'ชิ้น', isDefault: true },
      { name: 'หน่วย', isDefault: false },
      { name: 'เซ็ต', isDefault: false },
      { name: 'คู่', isDefault: false },
      { name: 'ล้อ', isDefault: false },
    ];

    for (const unit of defaultUnits) {
      const existing = await db
        .select()
        .from(units)
        .where(eq(units.name, unit.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(units).values({
          id: crypto.randomUUID(),
          ...unit,
        });
      }
    }
    console.log('✅ Created default units');

    // 5. Create pricing tiers
    const defaultPricingTiers = [
      { name: 'ปลีก', isDefault: true },
      { name: 'ส่ง', isDefault: false },
      { name: 'VIP', isDefault: false },
    ];

    for (const tier of defaultPricingTiers) {
      const existing = await db
        .select()
        .from(pricingTiers)
        .where(eq(pricingTiers.name, tier.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(pricingTiers).values({
          id: crypto.randomUUID(),
          ...tier,
        });
      }
    }
    console.log('✅ Created default pricing tiers');

    // 6. Create default categories
    const defaultCategories = [
      { name: 'ยางรถยนต์', type: 'product' as const },
      { name: 'ล้อแม็กซ์', type: 'product' as const },
      { name: 'น้ำมันเครื่อง', type: 'product' as const },
      { name: 'อะไหล่รถยนต์', type: 'product' as const },
      { name: 'อุปกรณ์เสริม', type: 'product' as const },
      { name: 'บริการเปลี่ยนยาง', type: 'service' as const },
      { name: 'บริการถ่วงล้อ', type: 'service' as const },
      { name: 'บริการเปลี่ยนน้ำมัน', type: 'service' as const },
      { name: 'บริการซ่อมทั่วไป', type: 'service' as const },
      { name: 'บริการล้างรถ', type: 'service' as const },
    ];

    for (const category of defaultCategories) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.name, category.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categories).values({
          id: crypto.randomUUID(),
          ...category,
          createdAt: new Date(),
        });
      }
    }
    console.log('✅ Created default categories');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('   Username: owner');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
seedData();

export default seedData;
