import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { customers, vehicles, vehicleBrands, vehicleModels } from '../db/schema';
import { eq, and, desc, asc, like } from 'drizzle-orm';

const customersRouter = new Hono();

// Customer schema
const customerSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อลูกค้า'),
  phone: z.string().optional(),
  email: z.string().email('กรุณาระบุอีเมลให้ถูกต้อง').optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  zipcode: z.string().optional(),
  taxId: z.string().optional(),
  note: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Vehicle schema
const vehicleSchema = z.object({
  customerId: z.string().uuid('กรุณาระบุลูกค้า'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  mileage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  note: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/customers - Get all customers with filters
customersRouter.get('/', async (c) => {
  try {
    const search = c.req.query('search') as string | undefined;
    const active = c.req.query('active') as string | undefined;
    const limit = parseInt(c.req.query('limit') || '50');

    let conditions = [];
    
    // Apply filters
    if (search) {
      conditions.push(like(customers.name, `%${search}%`));
    }
    
    if (active !== undefined) {
      conditions.push(eq(customers.isActive, active === 'true'));
    }

    const result = await db.select().from(customers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(customers.createdAt))
      .limit(limit);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลลูกค้าได้',
    }, 500);
  }
});

// GET /api/customers/vehicle-brands - Get all vehicle brands
customersRouter.get('/vehicle-brands', async (c) => {
  try {
    const brands = await db.select().from(vehicleBrands).where(eq(vehicleBrands.isActive, true)).orderBy(vehicleBrands.name);
    
    return c.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Get vehicle brands error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลยี่ห้อรถได้',
    }, 500);
  }
});

// GET /api/customers/vehicle-models - Get vehicle models by brand
customersRouter.get('/vehicle-models', async (c) => {
  try {
    const brandId = c.req.query('brandId') as string;
    
    let models;
    if (brandId) {
      models = await db.select().from(vehicleModels)
        .where(and(eq(vehicleModels.brandId, brandId), eq(vehicleModels.isActive, true)))
        .orderBy(vehicleModels.name);
    } else {
      models = await db.select().from(vehicleModels).where(eq(vehicleModels.isActive, true)).orderBy(vehicleModels.name);
    }
    
    return c.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('Get vehicle models error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลรุ่นรถได้',
    }, 500);
  }
});

// POST /api/customers/vehicle-brands - Create new vehicle brand
customersRouter.post('/vehicle-brands', zValidator('json', z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อยี่ห้อรถ'),
  country: z.string().optional(),
})), async (c) => {
  try {
    const { name, country } = c.req.valid('json');
    
    // Check if brand already exists
    const existing = await db.select().from(vehicleBrands).where(eq(vehicleBrands.name, name)).limit(1);
    if (existing.length > 0) {
      return c.json({
        success: false,
        error: 'ยี่ห้อรถนี้มีอยู่แล้ว',
      }, 400);
    }
    
    const newBrand = {
      id: crypto.randomUUID(),
      name,
      country: country || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(vehicleBrands).values(newBrand);
    
    return c.json({
      success: true,
      data: newBrand,
      message: 'เพิ่มยี่ห้อรถเรียบร้อย',
    });
  } catch (error) {
    console.error('Create vehicle brand error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถเพิ่มยี่ห้อรถได้',
    }, 500);
  }
});

// POST /api/customers/vehicle-models - Create new vehicle model
customersRouter.post('/vehicle-models', zValidator('json', z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อรุ่นรถ'),
  brandId: z.string().uuid('กรุณาระบุยี่ห้อรถ'),
  category: z.string().optional(),
})), async (c) => {
  try {
    const { name, brandId, category } = c.req.valid('json');
    
    // Check if model already exists for this brand
    const existing = await db.select().from(vehicleModels)
      .where(and(eq(vehicleModels.name, name), eq(vehicleModels.brandId, brandId)))
      .limit(1);
    if (existing.length > 0) {
      return c.json({
        success: false,
        error: 'รุ่นรถนี้มีอยู่แล้ว',
      }, 400);
    }
    
    const newModel = {
      id: crypto.randomUUID(),
      name,
      brandId,
      category: category || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(vehicleModels).values(newModel);
    
    return c.json({
      success: true,
      data: newModel,
      message: 'เพิ่มรุ่นรถเรียบร้อย',
    });
  } catch (error) {
    console.error('Create vehicle model error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถเพิ่มรุ่นรถได้',
    }, 500);
  }
});

// GET /api/customers/:id - Get customer by ID with vehicles
customersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🔍 Getting customer details for ID:', id);
    
    const customer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    console.log('👤 Customer query result:', customer.length, 'records');
    
    if (customer.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบลูกค้า',
      }, 404);
    }

    // Get customer's vehicles
    console.log('🚗 Getting vehicles for customer:', id);
    const customerVehicles = await db.select().from(vehicles).where(eq(vehicles.customerId, id));
    console.log('🚗 Vehicles query result:', customerVehicles.length, 'vehicles');

    return c.json({
      success: true,
      data: {
        ...customer[0],
        vehicles: customerVehicles,
      },
    });
  } catch (error) {
    console.error('❌ Get customer error:', error);
    console.error('❌ Error stack:', error.stack);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลลูกค้าได้',
    }, 500);
  }
});

// POST /api/customers - Create new customer
customersRouter.post('/', zValidator('json', customerSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const newId = crypto.randomUUID();
    
    await db.insert(customers).values({
      id: newId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json({
      success: true,
      data: {
        id: newId,
        ...data,
      },
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างลูกค้าได้',
    }, 500);
  }
});

// PUT /api/customers/:id - Update customer
customersRouter.put('/:id', zValidator('json', customerSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    
    await db.update(customers).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(customers.id, id));

    return c.json({
      success: true,
      data: { id, ...data },
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทลูกค้าได้',
    }, 500);
  }
});

// DELETE /api/customers/:id - Delete customer (soft delete)
customersRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await db.update(customers).set({
      isActive: false,
      updatedAt: new Date(),
    }).where(eq(customers.id, id));

    return c.json({
      success: true,
      message: 'ลบลูกค้าเรียบร้อย',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบลูกค้าได้',
    }, 500);
  }
});

// GET /api/customers/:id/vehicles - Get customer's vehicles
customersRouter.get('/:id/vehicles', async (c) => {
  try {
    const customerId = c.req.param('id');
    
    const result = await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลรถได้',
    }, 500);
  }
});

// POST /api/customers/:id/vehicles - Add vehicle to customer
customersRouter.post('/:id/vehicles', zValidator('json', vehicleSchema), async (c) => {
  try {
    const customerId = c.req.param('id');
    const data = c.req.valid('json');
    const newId = crypto.randomUUID();
    
    const { customerId: _, ...vehicleData } = data;
    
    await db.insert(vehicles).values({
      id: newId,
      customerId,
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json({
      success: true,
      data: {
        id: newId,
        customerId,
        ...vehicleData,
      },
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถเพิ่มรถได้',
    }, 500);
  }
});

// PUT /api/vehicles/:id - Update vehicle
customersRouter.put('/vehicles/:id', zValidator('json', vehicleSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    
    await db.update(vehicles).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(vehicles.id, id));

    return c.json({
      success: true,
      data: { id, ...data },
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทรถได้',
    }, 500);
  }
});

// DELETE /api/vehicles/:id - Delete vehicle (soft delete)
customersRouter.delete('/vehicles/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await db.update(vehicles).set({
      isActive: false,
      updatedAt: new Date(),
    }).where(eq(vehicles.id, id));

    return c.json({
      success: true,
      message: 'ลบรถเรียบร้อย',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบรถได้',
    }, 500);
  }
});

export default customersRouter;
