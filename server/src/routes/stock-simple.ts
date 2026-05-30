import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const stockRouter = new Hono();

// Stock movement schema
const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(['in', 'out', 'return', 'loss', 'damage', 'correction']),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  costAtTime: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  lossReason: z.string().optional(),
  note: z.string().optional(),
});

// Mock stock movements data (since schema not ready)
let mockStockMovements: any[] = [
  {
    id: '1',
    productId: '1',
    type: 'in',
    quantity: '100',
    costAtTime: '50.00',
    note: 'รับยางเข้า stock',
    createdAt: new Date().toISOString(),
    productName: 'ยาง Bridgestone 205/55R16',
  },
  {
    id: '2',
    productId: '1',
    type: 'out',
    quantity: '2',
    note: 'ขายให้ลูกค้า',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    productName: 'ยาง Bridgestone 205/55R16',
  },
];

// GET /api/stock/movements - Get stock movements
stockRouter.get('/movements', async (c) => {
  try {
    const productId = c.req.query('productId') as string | undefined;
    const type = c.req.query('type') as string | undefined;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');

    let result = mockStockMovements;

    // Apply filters
    if (productId) {
      result = result.filter(m => m.productId === productId);
    }
    if (type) {
      result = result.filter(m => m.type === type);
    }

    // Add product info
    const productIds = [...new Set(result.map(m => m.productId))];
    const productInfo = await db
      .select({ id: products.id, name: products.name, sku: products.sku })
      .from(products)
      .where(eq(products.id, productIds[0])); // Simplified for now

    result = result.map(movement => ({
      ...movement,
      productName: movement.productName || 'Unknown Product',
      productSku: '',
    }));

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedResult = result.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: paginatedResult,
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

    // Mock stock balance data
    const mockBalance: any[] = [
      {
        productId: '1',
        productName: 'ยาง Bridgestone 205/55R16',
        productSku: 'BS20555R16',
        currentQty: '98',
        minStock: '10',
        alertEnabled: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        productId: '2',
        productName: 'น้ำมันเครื่อง Mobil 5W-30',
        productSku: 'MOB5W30',
        currentQty: '5',
        minStock: '10',
        alertEnabled: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    let result = mockBalance;
    if (productId) {
      result = result.filter(b => b.productId === productId);
    }
    if (lowStock === 'true') {
      result = result.filter(b => parseFloat(b.currentQty) < parseFloat(b.minStock));
    }

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

    // For loss/damage/correction, require reason
    if (['loss', 'damage', 'correction'].includes(data.type) && !data.lossReason) {
      return c.json({
        success: false,
        error: 'กรุณาระบุเหตุผลสำหรับการเคลื่อนไหวประเภทนี้',
      }, 400);
    }

    const newMovement = {
      id: crypto.randomUUID(),
      ...data,
      productName: product[0].name,
      createdAt: new Date().toISOString(),
    };

    mockStockMovements.unshift(newMovement);

    return c.json({
      success: true,
      data: { id: newMovement.id },
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถบันทึกการเคลื่อนไหวสต็อกได้',
    }, 500);
  }
});

// GET /api/stock/alerts - Get low stock alerts
stockRouter.get('/alerts', async (c) => {
  try {
    // Mock alerts data
    const mockAlerts: any[] = [
      {
        productId: '2',
        productName: 'น้ำมันเครื่อง Mobil 5W-30',
        productSku: 'MOB5W30',
        currentQty: '5',
        minStock: '10',
        alertType: 'low_stock',
        createdAt: new Date().toISOString(),
      },
    ];

    return c.json({
      success: true,
      data: mockAlerts,
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

    const newMovement = {
      id: crypto.randomUUID(),
      ...movementData,
      productName: product[0].name,
      createdAt: new Date().toISOString(),
    };

    mockStockMovements.unshift(newMovement);

    return c.json({
      success: true,
      data: { id: newMovement.id },
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
