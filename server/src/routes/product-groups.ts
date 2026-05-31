import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { productGroups, products } from '../db/schema';
import { eq, desc, like, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const productGroupsRouter = new Hono();

// Schemas
const createGroupSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อกลุ่ม'),
  description: z.string().optional(),
  skuPrefix: z.string().max(10, 'SKU Prefix ต้องไม่เกิน 10 ตัวอักษร').optional(),
});

const updateGroupSchema = createGroupSchema.partial();

// GET /api/product-groups - Get all groups
productGroupsRouter.get('/', async (c) => {
  try {
    const search = c.req.query('search') as string | undefined;
    const includeInactive = c.req.query('includeInactive') === 'true';

    let query = db.select().from(productGroups).orderBy(desc(productGroups.createdAt));

    const conditions = [];
    
    if (!includeInactive) {
      conditions.push(eq(productGroups.isActive, true));
    }

    if (search) {
      conditions.push(like(productGroups.name, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const result = await query;

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get product groups error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลกลุ่มสินค้าได้',
    }, 500);
  }
});

// GET /api/product-groups/:id - Get single group
productGroupsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.id, id))
      .limit(1);

    if (result.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบกลุ่มสินค้า',
      }, 404);
    }

    // Get products in this group
    const groupProducts = await db
      .select()
      .from(products)
      .where(eq(products.groupId, id))
      .orderBy(products.name);

    return c.json({
      success: true,
      data: {
        ...result[0],
        products: groupProducts,
      },
    });
  } catch (error) {
    console.error('Get product group error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลกลุ่มสินค้าได้',
    }, 500);
  }
});

// POST /api/product-groups - Create new group
productGroupsRouter.post('/', zValidator('json', createGroupSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // Check if group name already exists
    const existing = await db
      .select()
      .from(productGroups)
      .where(and(
        eq(productGroups.name, data.name),
        eq(productGroups.isActive, true)
      ))
      .limit(1);

    if (existing.length > 0) {
      return c.json({
        success: false,
        error: 'ชื่อกลุ่มนี้มีอยู่แล้ว',
      }, 400);
    }

    const newGroup = {
      id: uuidv4(),
      name: data.name,
      description: data.description || null,
      skuPrefix: data.skuPrefix || null,
      isActive: true,
    };

    const result = await db.insert(productGroups).values(newGroup);

    return c.json({
      success: true,
      data: {
        id: newGroup.id,
        name: newGroup.name,
      },
    });
  } catch (error) {
    console.error('Create product group error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างกลุ่มสินค้าได้',
    }, 500);
  }
});

// PUT /api/product-groups/:id - Update group
productGroupsRouter.put('/:id', zValidator('json', updateGroupSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // Check if group exists
    const existing = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบกลุ่มสินค้า',
      }, 404);
    }

    // Check if name conflicts with other groups
    if (data.name && data.name !== existing[0].name) {
      const nameConflict = await db
        .select()
        .from(productGroups)
        .where(and(
          eq(productGroups.name, data.name),
          eq(productGroups.isActive, true),
          // Not the current group
        ))
        .limit(1);

      if (nameConflict.length > 0) {
        return c.json({
          success: false,
          error: 'ชื่อกลุ่มนี้มีอยู่แล้ว',
        }, 400);
      }
    }

    const result = await db
      .update(productGroups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(productGroups.id, id));

    return c.json({
      success: true,
      data: {
        id,
        updated: true, // MySQL doesn't provide affectedRows in the same way
      },
    });
  } catch (error) {
    console.error('Update product group error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทกลุ่มสินค้าได้',
    }, 500);
  }
});

// DELETE /api/product-groups/:id - Delete group (soft delete)
productGroupsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Check if group exists
    const existing = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบกลุ่มสินค้า',
      }, 404);
    }

    // Check if group has products
    const productsInGroup = await db
      .select()
      .from(products)
      .where(and(
        eq(products.groupId, id),
        eq(products.isActive, true)
      ))
      .limit(1);

    if (productsInGroup.length > 0) {
      return c.json({
        success: false,
        error: 'ไม่สามารถลบกลุ่มที่มีสินค้าอยู่ กรุณาลบสินค้าหรือย้ายออกก่อน',
      }, 400);
    }

    // Soft delete
    const result = await db
      .update(productGroups)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(productGroups.id, id));

    return c.json({
      success: true,
      data: {
        id,
        deleted: true, // MySQL doesn't provide affectedRows in the same way
      },
    });
  } catch (error) {
    console.error('Delete product group error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบกลุ่มสินค้าได้',
    }, 500);
  }
});

export default productGroupsRouter;
