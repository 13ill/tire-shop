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

// Product variant schema
const productVariantSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อรุ่น'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  additionalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').default('0'),
  isActive: z.boolean().default(true),
});

// Product price schema
const productPriceSchema = z.object({
  variantId: z.string().uuid().optional(),
  tierId: z.string().uuid(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
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

    let query = db
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
      .leftJoin(units, eq(products.unitId, units.id));

    // Apply filters
    if (type) {
      query = query.where(eq(products.type, type));
    }
    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    if (search) {
      query = query.where(
        like(products.name, `%${search}%`)
      );
    }
    if (active !== undefined) {
      query = query.where(eq(products.isActive, active === 'true'));
    }

    // Get total count for pagination
    let countQuery = db
      .select({ count: products.id })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (type) countQuery = countQuery.where(eq(products.type, type));
    if (categoryId) countQuery = countQuery.where(eq(products.categoryId, categoryId));
    if (search) countQuery = countQuery.where(like(products.name, `%${search}%`));
    if (active !== undefined) countQuery = countQuery.where(eq(products.isActive, active === 'true'));

    const countResult = await countQuery;
    const total = countResult.length;

    // Apply pagination and ordering
    const result = await query
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

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

// GET /api/products/:id - Get product by ID with variants and prices
productsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Get product details
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

    const productData = product[0];

    // Get variants if any
    let variants: any[] = [];
    if (productData.hasVariants) {
      // TODO: Implement variants when schema is ready
      variants = [];
    }

    // Get prices
    // TODO: Implement prices when schema is ready
    const prices: any[] = [];

    return c.json({
      success: true,
      data: {
        ...productData,
        variants,
        prices,
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

    // TODO: Check if product has stock movements, sales, etc.
    // For now, we'll just soft delete
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

// POST /api/products/:id/variants - Add product variant
productsRouter.post('/:id/variants', zValidator('json', productVariantSchema), async (c) => {
  try {
    const productId = c.req.param('id');
    const data = c.req.valid('json');

    // Check if product exists and has variants enabled
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่ต้องการ',
      }, 404);
    }

    if (!product[0].hasVariants) {
      return c.json({
        success: false,
        error: 'สินค้านี้ไม่รองรับรุ่นย่อย',
      }, 400);
    }

    const newId = crypto.randomUUID();
    await db.insert(productVariants).values({
      id: newId,
      productId,
      ...data,
    });

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create product variant error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างรุ่นสินค้าได้',
    }, 500);
  }
});

// PUT /api/products/:id/variants/:variantId - Update product variant
productsRouter.put('/:id/variants/:variantId', zValidator('json', productVariantSchema.partial()), async (c) => {
  try {
    const productId = c.req.param('id');
    const variantId = c.req.param('variantId');
    const data = c.req.valid('json');

    // Check if variant exists and belongs to product
    const existing = await db
      .select()
      .from(productVariants)
      .where(and(
        eq(productVariants.id, variantId),
        eq(productVariants.productId, productId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบรุ่นสินค้าที่ต้องการแก้ไข',
      }, 404);
    }

    await db
      .update(productVariants)
      .set(data)
      .where(eq(productVariants.id, variantId));

    return c.json({ success: true });
  } catch (error) {
    console.error('Update product variant error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทรุ่นสินค้าได้',
    }, 500);
  }
});

// DELETE /api/products/:id/variants/:variantId - Delete product variant
productsRouter.delete('/:id/variants/:variantId', async (c) => {
  try {
    const productId = c.req.param('id');
    const variantId = c.req.param('variantId');

    // Check if variant exists and belongs to product
    const existing = await db
      .select()
      .from(productVariants)
      .where(and(
        eq(productVariants.id, variantId),
        eq(productVariants.productId, productId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบรุ่นสินค้าที่ต้องการลบ',
      }, 404);
    }

    await db
      .delete(productVariants)
      .where(eq(productVariants.id, variantId));

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete product variant error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบรุ่นสินค้าได้',
    }, 500);
  }
});

// POST /api/products/:id/prices - Set product price
productsRouter.post('/:id/prices', zValidator('json', productPriceSchema), async (c) => {
  try {
    const productId = c.req.param('id');
    const data = c.req.valid('json');

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่ต้องการ',
      }, 404);
    }

    // Check if pricing tier exists
    const tier = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.id, data.tierId))
      .limit(1);

    if (tier.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบระดับราคาที่เลือก',
      }, 400);
    }

    // Check if variant exists (if provided)
    if (data.variantId) {
      const variant = await db
        .select()
        .from(productVariants)
        .where(and(
          eq(productVariants.id, data.variantId),
          eq(productVariants.productId, productId)
        ))
        .limit(1);

      if (variant.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบรุ่นสินค้าที่เลือก',
        }, 400);
      }
    }

    const newId = crypto.randomUUID();
    await db.insert(productPrices).values({
      id: newId,
      productId,
      ...data,
    });

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create product price error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถตั้งราคาสินค้าได้',
    }, 500);
  }
});

export default productsRouter;
