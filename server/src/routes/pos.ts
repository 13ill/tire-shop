import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const posRouter = new Hono();

// Types
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  type: 'product' | 'service';
  quantity: number;
  unitPrice: number;
  laborPrice?: number;
  totalPrice: number;
  discount?: number;
  notes?: string;
}

interface Transaction {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
  paymentDetails: any;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

// Mock data storage (ในอนาคตจะเก็บใน database)
let mockTransactions: Transaction[] = [];
let mockCustomers: any[] = [
  { id: '1', name: 'ลูกค้าทั่วไป', phone: '', vehicle: '' }
];

// Schemas
const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  laborPrice: z.number().min(0).optional(),
  discount: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const transactionSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(cartItemSchema),
  discount: z.number().min(0),
  vatRate: z.number().min(0).max(100),
  paymentMethod: z.string(),
  paymentDetails: z.object({
    cashAmount: z.number().min(0).optional(),
    changeAmount: z.number().min(0).optional(),
  }).optional(),
});

// GET /api/pos/products - Get products for POS
posRouter.get('/products', async (c) => {
  try {
    const search = c.req.query('search') as string | undefined;
    const type = c.req.query('type') as string | undefined;
    const limit = parseInt(c.req.query('limit') || '50');

    let query = db.select().from(products).where(eq(products.isActive, true));

    // Apply filters - สำหรับตอนนี้ข้ามการค้นหาและกรอง
    const result = await query.limit(limit);

    // Transform for POS display
    const posProducts = result.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      type: product.type,
      basePrice: product.basePrice || 0,
      laborPrice: product.laborPrice || 0,
      costPrice: product.costPrice || 0,
      unitId: product.unitId,
      minStock: product.minStock || 0,
      currentStock: 0, // ต้องดึงจาก stock balance
      barcode: product.barcode,
    }));

    return c.json({
      success: true,
      data: posProducts,
    });
  } catch (error) {
    console.error('Get POS products error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลสินค้าได้',
    }, 500);
  }
});

// GET /api/pos/customers - Get customers for POS
posRouter.get('/customers', async (c) => {
  try {
    const search = c.req.query('search') as string | undefined;

    // Mock customers data (ในอนาคตจะดึงจาก database)
    let result = mockCustomers;

    if (search) {
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search)
      );
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get POS customers error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลลูกค้าได้',
    }, 500);
  }
});

// GET /api/pos/transactions - Get transaction history
posRouter.get('/transactions', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const status = c.req.query('status') as string | undefined;

    let result = mockTransactions;

    if (status) {
      result = result.filter(t => t.status === status);
    }

    // Sort by date descending
    result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
    console.error('Get POS transactions error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงประวัติการขายได้',
    }, 500);
  }
});

// POST /api/pos/transactions - Create new transaction
posRouter.post('/transactions', zValidator('json', transactionSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const userId = 'system'; // จาก JWT middleware (ชั่วคราว)

    // Calculate totals
    let subtotal = 0;
    const items: CartItem[] = [];

    for (const item of data.items) {
      // Get product details
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (product.length === 0) {
        return c.json({
          success: false,
          error: `ไม่พบสินค้า ID: ${item.productId}`,
        }, 400);
      }

      const productData = product[0];
      const itemTotal = (item.unitPrice * item.quantity) + (item.laborPrice || 0);
      const discountAmount = itemTotal * ((item.discount || 0) / 100);
      const finalPrice = itemTotal - discountAmount;

      subtotal += finalPrice;

      items.push({
        id: uuidv4(),
        productId: item.productId,
        productName: productData.name,
        productSku: productData.sku || undefined,
        type: productData.type as 'product' | 'service',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        laborPrice: item.laborPrice,
        totalPrice: finalPrice,
        discount: item.discount,
        notes: item.notes,
      });
    }

    // Calculate VAT and total
    const discountAmount = subtotal * (data.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * (data.vatRate / 100);
    const total = afterDiscount + vatAmount;

    // Create transaction
    const transaction: Transaction = {
      id: uuidv4(),
      customerId: data.customerId || undefined,
      items,
      subtotal,
      discount: discountAmount,
      vat: vatAmount,
      total,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails || {},
      status: 'completed',
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    // Store transaction (ในอนาคตจะบันทึกใน database)
    mockTransactions.unshift(transaction);

    // TODO: Update stock for products
    // TODO: Create receipt/invoice
    // TODO: Send to printer if needed

    return c.json({
      success: true,
      data: {
        transactionId: transaction.id,
        total,
        changeAmount: data.paymentDetails?.changeAmount || 0,
        receiptUrl: `/api/pos/receipt/${transaction.id}`,
      },
    });
  } catch (error) {
    console.error('Create POS transaction error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างการขายได้',
    }, 500);
  }
});

// GET /api/pos/receipt/:id - Get receipt
posRouter.get('/receipt/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const transaction = mockTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return c.json({
        success: false,
        error: 'ไม่พบใบเสร็จ',
      }, 404);
    }

    // Get customer info if exists
    let customerInfo = null;
    if (transaction.customerId) {
      customerInfo = mockCustomers.find(c => c.id === transaction.customerId);
    }

    const receipt = {
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
      customer: customerInfo,
      items: transaction.items,
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      vat: transaction.vat,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      paymentDetails: transaction.paymentDetails,
    };

    return c.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงใบเสร็จได้',
    }, 500);
  }
});

// GET /api/pos/stats - Get POS statistics
posRouter.get('/stats', async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = mockTransactions.filter(t => 
      new Date(t.createdAt) >= today && t.status === 'completed'
    );

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const todayCount = todayTransactions.length;

    // Mock stats (ในอนาคจะคำนวณจาก database)
    const stats = {
      today: {
        sales: todaySales,
        count: todayCount,
        averageTransaction: todayCount > 0 ? todaySales / todayCount : 0,
      },
      week: {
        sales: 0,
        count: 0,
        averageTransaction: 0,
      },
      month: {
        sales: 0,
        count: 0,
        averageTransaction: 0,
      },
      topProducts: [], // สินค้าขายดี
      recentTransactions: mockTransactions.slice(0, 5),
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get POS stats error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงสถิติได้',
    }, 500);
  }
});

export default posRouter;
