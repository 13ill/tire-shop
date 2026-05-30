import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { settings, paymentMethods, units } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const settingsRouter = new Hono();

// Settings schemas
const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อวิธีการชำระเงิน'),
  surchargePercent: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  discountPercent: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  sortOrder: z.number().int().min(0),
});

const unitSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อหน่วย'),
  isDefault: z.boolean(),
});

// GET /api/settings - Get all settings
settingsRouter.get('/', async (c) => {
  try {
    const allSettings = await db.select().from(settings);
    return c.json({
      success: true,
      data: allSettings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้',
    }, 500);
  }
});

// PUT /api/settings/:key - Update setting
settingsRouter.put('/:key', zValidator('json', settingSchema.partial()), async (c) => {
  try {
    const key = c.req.param('key');
    const data = c.req.valid('json');

    await db
      .update(settings)
      .set(data)
      .where(eq(settings.key, key));

    return c.json({ success: true });
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทการตั้งค่าได้',
    }, 500);
  }
});

// GET /api/settings/payment-methods - Get payment methods
settingsRouter.get('/payment-methods', async (c) => {
  try {
    const methods = await db
      .select()
      .from(paymentMethods)
      .orderBy(paymentMethods.sortOrder);

    return c.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลวิธีการชำระเงินได้',
    }, 500);
  }
});

// POST /api/settings/payment-methods - Create payment method
settingsRouter.post('/payment-methods', zValidator('json', paymentMethodSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    const newId = crypto.randomUUID();
    await db.insert(paymentMethods).values({
      id: newId,
      ...data,
      isActive: true,
    });

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create payment method error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างวิธีการชำระเงินได้',
    }, 500);
  }
});

// PUT /api/settings/payment-methods/:id - Update payment method
settingsRouter.put('/payment-methods/:id', zValidator('json', paymentMethodSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    await db
      .update(paymentMethods)
      .set(data)
      .where(eq(paymentMethods.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Update payment method error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทวิธีการชำระเงินได้',
    }, 500);
  }
});

// DELETE /api/settings/payment-methods/:id - Delete payment method
settingsRouter.delete('/payment-methods/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await db
      .update(paymentMethods)
      .set({ isActive: false })
      .where(eq(paymentMethods.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบวิธีการชำระเงินได้',
    }, 500);
  }
});

// GET /api/settings/units - Get units
settingsRouter.get('/units', async (c) => {
  try {
    const unitList = await db
      .select()
      .from(units)
      .orderBy(units.isDefault ? desc(units.isDefault) : units.name);

    return c.json({
      success: true,
      data: unitList,
    });
  } catch (error) {
    console.error('Get units error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลหน่วยนับได้',
    }, 500);
  }
});

// POST /api/settings/units - Create unit
settingsRouter.post('/units', zValidator('json', unitSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await db
        .update(units)
        .set({ isDefault: false })
        .where(eq(units.isDefault, true));
    }

    const newId = crypto.randomUUID();
    await db.insert(units).values({
      id: newId,
      ...data,
    });

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create unit error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างหน่วยนับได้',
    }, 500);
  }
});

// PUT /api/settings/units/:id - Update unit
settingsRouter.put('/units/:id', zValidator('json', unitSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await db
        .update(units)
        .set({ isDefault: false })
        .where(eq(units.isDefault, true));
    }

    await db
      .update(units)
      .set(data)
      .where(eq(units.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Update unit error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทหน่วยนับได้',
    }, 500);
  }
});

// DELETE /api/settings/units/:id - Delete unit
settingsRouter.delete('/units/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await db
      .delete(units)
      .where(eq(units.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete unit error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบหน่วยนับได้',
    }, 500);
  }
});

export default settingsRouter;
