import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { stockMovements, products } from '../db/schema';
import { eq, and, desc, asc, gte, lte } from 'drizzle-orm';

const stockRouter = new Hono();

// Stock movement schema
const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  type: z.enum(['in', 'out', 'return', 'loss', 'damage', 'correction']),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  costAtTime: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  lossReason: z.string().optional(),
  note: z.string().optional(),
});

// Stock count schema
const stockCountSchema = z.object({
  note: z.string().optional(),
});

// Stock count item schema  
const stockCountItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  actualQty: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
});

// GET /api/stock/movements - Get stock movements with filters
stockRouter.get('/movements', async (c) => {
  try {
    const productId = c.req.query('productId') as string | undefined;
    const type = c.req.query('type') as string | undefined;
    const startDate = c.req.query('startDate') as string | undefined;
    const endDate = c.req.query('endDate') as string | undefined;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        variantId: stockMovements.variantId,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        costAtTime: stockMovements.costAtTime,
        referenceType: stockMovements.referenceType,
        referenceId: stockMovements.referenceId,
        lossReason: stockMovements.lossReason,
        note: stockMovements.note,
        createdAt: stockMovements.createdAt,
        productName: products.name,
        productSku: products.sku,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id));

    // Apply filters
    if (productId) {
      query = query.where(eq(stockMovements.productId, productId));
    }
    if (type) {
      query = query.where(eq(stockMovements.type, type));
    }
    if (startDate) {
      query = query.where(gte(stockMovements.createdAt, new Date(startDate)));
    }
    if (endDate) {
      query = query.where(lte(stockMovements.createdAt, new Date(endDate)));
    }

    const result = await query
      .orderBy(desc(stockMovements.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total: result.length,
        totalPages: Math.ceil(result.length / limit),
      },
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลการเคลื่อนไหวสต็อกได้',
    }, 500);
  }
});

// GET /api/stock/balance - Get current stock balance
stockRouter.get('/balance', async (c) => {
  try {
    const productId = c.req.query('productId') as string | undefined;
    const lowStock = c.req.query('lowStock') as string | undefined;

    // TODO: Implement stock balance calculation when stock_balances table is ready
    // For now, return empty result
    const result: any[] = [];

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get stock balance error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลคงเหลือสต็อกได้',
    }, 500);
  }
});

// POST /api/stock/movements - Create stock movement
stockRouter.post('/movements', zValidator('json', stockMovementSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่เลือก',
      }, 400);
    }

    // Validate variant if provided
    if (data.variantId) {
      // TODO: Check variant when schema is ready
    }

    // For loss/damage/correction, require reason
    if (['loss', 'damage', 'correction'].includes(data.type) && !data.lossReason) {
      return c.json({
        success: false,
        error: 'กรุณาระบุเหตุผลสำหรับการเคลื่อนไหวประเภทนี้',
      }, 400);
    }

    const newId = crypto.randomUUID();
    await db.insert(stockMovements).values({
      id: newId,
      ...data,
      quantity: data.quantity,
      createdAt: new Date(),
    });

    // TODO: Update stock balance when stock_balances table is ready

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถบันทึกการเคลื่อนไหวสต็อกได้',
    }, 500);
  }
});

// GET /api/stock/counts - Get stock counts
stockRouter.get('/counts', async (c) => {
  try {
    // TODO: Implement when stock_counts table is ready
    const result: any[] = [];

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get stock counts error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลการตรวจนับสต็อกได้',
    }, 500);
  }
});

// POST /api/stock/counts - Create stock count
stockRouter.post('/counts', zValidator('json', stockCountSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // TODO: Implement when stock_counts table is ready
    const newId = crypto.randomUUID();

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create stock count error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างการตรวจนับสต็อกได้',
    }, 500);
  }
});

// GET /api/stock/alerts - Get low stock alerts
stockRouter.get('/alerts', async (c) => {
  try {
    // TODO: Implement when stock_balances table is ready
    const result: any[] = [];

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get stock alerts error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนสต็อกได้',
    }, 500);
  }
});

// POST /api/stock/adjustment - Manual stock adjustment
stockRouter.post('/adjustment', zValidator('json', stockMovementSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // Ensure type is correction
    const movementData = {
      ...data,
      type: 'correction' as const,
    };

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (product.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบสินค้าที่เลือก',
      }, 400);
    }

    const newId = crypto.randomUUID();
    await db.insert(stockMovements).values({
      id: newId,
      ...movementData,
      quantity: data.quantity,
      createdAt: new Date(),
    });

    // TODO: Update stock balance when stock_balances table is ready

    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถปรับปรุงสต็อกได้',
    }, 500);
  }
});

export default stockRouter;
