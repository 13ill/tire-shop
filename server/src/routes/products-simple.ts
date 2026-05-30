import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { products, categories, units, pricingTiers } from '../db/schema';
import { eq, and, desc, asc, like } from 'drizzle-orm';

const productsRouter = new Hono();

// Product schema
const productSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อสินค้า/บริการ'),
  description: z.string().optional(),
  type: z.enum(['product', 'service']),
  categoryId: z.string().uuid().optional(),
  hasVariants: z.boolean().default(false),
  hasLaborCost: z.boolean().default(false),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  laborPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  costMethod: z.enum(['fifo', 'average', 'manual']).default('average'),
  unitId: z.string().uuid().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  minStock: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').default('0'),
  alertEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

// GET /api/products - Get all products with filters
productsRouter.get('/', async (c) => {
  try {
    const type = c.req.query('type') as 'product' | 'service' | undefined;
    const categoryId = c.req.query('categoryId') as string | undefined;
    const search = c.req.query('search') as string | undefined;
    const active = c.req.query('active') as string | undefined;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query with filters
    let result;
    if (type && categoryId && search && active !== undefined) {
      result = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          type: products.type,
          hasVariants: products.hasVariants,
          hasLaborCost: products.hasLaborCost,
          basePrice: products.basePrice,
          laborPrice: products.laborPrice,
          costPrice: products.costPrice,
          costMethod: products.costMethod,
          unitId: products.unitId,
          sku: products.sku,
          barcode: products.barcode,
          minStock: products.minStock,
          alertEnabled: products.alertEnabled,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
          unitName: units.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(units, eq(products.unitId, units.id))
        .where(and(
          eq(products.type, type),
          eq(products.categoryId, categoryId),
          like(products.name, `%${search}%`),
          eq(products.isActive, active === 'true')
        ))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // Simple query without complex filters
      result = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          type: products.type,
          hasVariants: products.hasVariants,
          hasLaborCost: products.hasLaborCost,
          basePrice: products.basePrice,
          laborPrice: products.laborPrice,
          costPrice: products.costPrice,
          costMethod: products.costMethod,
          unitId: products.unitId,
          sku: products.sku,
          barcode: products.barcode,
          minStock: products.minStock,
          alertEnabled: products.alertEnabled,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
          unitName: units.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(units, eq(products.unitId, units.id))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // Get total count (simplified)
    const total = result.length;

    return c.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลสินค้าได้',
    }, 500);
  }
});

// GET /api/products/:id - Get product by ID
productsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const product = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        type: products.type,
        hasVariants: products.hasVariants,
        hasLaborCost: products.hasLaborCost,
        basePrice: products.basePrice,
        laborPrice: products.laborPrice,
        costPrice: products.costPrice,
        costMethod: products.costMethod,
        unitId: products.unitId,
        sku: products.sku,
        barcode: products.barcode,
        minStock: products.minStock,
        alertEnabled: products.alertEnabled,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
        unitName: units.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(units, eq(products.unitId, units.id))
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่ต้องการ',
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        ...product[0],
        variants: [], // TODO: Implement when schema ready
        prices: [],   // TODO: Implement when schema ready
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลสินค้าได้',
    }, 500);
  }
});

// POST /api/products - Create product
productsRouter.post('/', zValidator('json', productSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // Validate category if provided
    if (data.categoryId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (category.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบหมวดหมู่ที่เลือก',
        }, 400);
      }

      // Category type must match product type
      if (category[0].type !== data.type) {
        return c.json({
          success: false,
          error: 'ประเภทหมวดหมู่ไม่ตรงกับประเภทสินค้า',
        }, 400);
      }
    }

    // Validate unit if provided
    if (data.unitId) {
      const unit = await db
        .select()
        .from(units)
        .where(eq(units.id, data.unitId))
        .limit(1);

      if (unit.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบหน่วยนับที่เลือก',
        }, 400);
      }
    }

    const newId = crypto.randomUUID();
    await db.insert(products).values({
      id: newId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create product error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างสินค้าได้',
    }, 500);
  }
});

// PUT /api/products/:id - Update product
productsRouter.put('/:id', zValidator('json', productSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    // Check if product exists
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่ต้องการแก้ไข',
      }, 404);
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (category.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบหมวดหมู่ที่เลือก',
        }, 400);
      }

      const productType = data.type || existing[0].type;
      if (category[0].type !== productType) {
        return c.json({
          success: false,
          error: 'ประเภทหมวดหมู่ไม่ตรงกับประเภทสินค้า',
        }, 400);
      }
    }

    // Validate unit if provided
    if (data.unitId) {
      const unit = await db
        .select()
        .from(units)
        .where(eq(units.id, data.unitId))
        .limit(1);

      if (unit.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบหน่วยนับที่เลือก',
        }, 400);
      }
    }

    await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทสินค้าได้',
    }, 500);
  }
});

// DELETE /api/products/:id - Delete product
productsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Check if product exists
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่ต้องการลบ',
      }, 404);
    }

    // Soft delete
    await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบสินค้าได้',
    }, 500);
  }
});

export default productsRouter;
