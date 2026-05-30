import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { categories } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

const categoriesRouter = new Hono();

// Category schema
const categorySchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
  type: z.enum(['product', 'service']),
  parentId: z.string().uuid().optional(),
});

// GET /api/categories - Get all categories
categoriesRouter.get('/', async (c) => {
  try {
    const type = c.req.query('type') as 'product' | 'service' | undefined;
    
    let result;
    if (type) {
      result = await db
        .select()
        .from(categories)
        .where(eq(categories.type, type))
        .orderBy(categories.name);
    } else {
      result = await db
        .select()
        .from(categories)
        .orderBy(categories.name);
    }
    
    // Build tree structure
    const buildTree = (items: any[], parentId: string | null = null): any[] => {
      return items
        .filter(item => 
          parentId === null 
            ? item.parentId === null || item.parentId === undefined
            : item.parentId === parentId
        )
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    
    const tree = buildTree(result);
    
    return c.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
    }, 500);
  }
});

// GET /api/categories/:id - Get category by ID
categoriesRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    
    if (category.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบหมวดหมู่ที่ต้องการ',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: category[0],
    });
  } catch (error) {
    console.error('Get category error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
    }, 500);
  }
});

// POST /api/categories - Create category
categoriesRouter.post('/', zValidator('json', categorySchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // Check if name already exists for the same type
    const existing = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.name, data.name),
        eq(categories.type, data.type)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      return c.json({
        success: false,
        error: 'ชื่อหมวดหมู่นี้มีอยู่แล้วในประเภทเดียวกัน',
      }, 400);
    }
    
    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.parentId))
        .limit(1);
      
      if (parent.length === 0) {
        return c.json({
          success: false,
          error: 'ไม่พบหมวดหมู่หลักที่เลือก',
        }, 400);
      }
      
      // Parent must be same type
      if (parent[0].type !== data.type) {
        return c.json({
          success: false,
          error: 'หมวดหมู่ย่อยต้องเป็นประเภทเดียวกับหมวดหมู่หลัก',
        }, 400);
      }
    }
    
    const newId = crypto.randomUUID();
    await db.insert(categories).values({
      id: newId,
      ...data,
      createdAt: new Date(),
    });
    
    return c.json({
      success: true,
      data: { id: newId },
    });
  } catch (error) {
    console.error('Create category error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถสร้างหมวดหมู่ได้',
    }, 500);
  }
});

// PUT /api/categories/:id - Update category
categoriesRouter.put('/:id', zValidator('json', categorySchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    
    // Check if category exists
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    
    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข',
      }, 404);
    }
    
    // Check name uniqueness if name is being changed
    if (data.name && data.name !== existing[0].name) {
      const nameCheck = await db
        .select()
        .from(categories)
        .where(and(
          eq(categories.name, data.name),
          eq(categories.type, data.type || existing[0].type),
          // Exclude current category
          // Note: Drizzle doesn't support neq directly, so we'll handle this in application logic
        ))
        .limit(1);
      
      if (nameCheck.length > 0 && nameCheck[0].id !== id) {
        return c.json({
          success: false,
          error: 'ชื่อหมวดหมู่นี้มีอยู่แล้วในประเภทเดียวกัน',
        }, 400);
      }
    }
    
    // Validate parent changes
    if (data.parentId !== undefined) {
      if (data.parentId) {
        // Check parent exists
        const parent = await db
          .select()
          .from(categories)
          .where(eq(categories.id, data.parentId))
          .limit(1);
        
        if (parent.length === 0) {
          return c.json({
            success: false,
            error: 'ไม่พบหมวดหมู่หลักที่เลือก',
          }, 400);
        }
        
        // Parent must be same type
        const parentType = data.type || existing[0].type;
        if (parent[0].type !== parentType) {
          return c.json({
            success: false,
            error: 'หมวดหมู่ย่อยต้องเป็นประเภทเดียวกับหมวดหมู่หลัก',
          }, 400);
        }
        
        // Prevent circular reference
        if (data.parentId === id) {
          return c.json({
            success: false,
            error: 'ไม่สามารถตั้งหมวดหมู่เป็นลูกของตัวเองได้',
          }, 400);
        }
      }
    }
    
    await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id));
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถอัพเดทหมวดหมู่ได้',
    }, 500);
  }
});

// DELETE /api/categories/:id - Delete category
categoriesRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if category exists
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    
    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'ไม่พบหมวดหมู่ที่ต้องการลบ',
      }, 404);
    }
    
    // Check if category has children
    const children = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, id))
      .limit(1);
    
    if (children.length > 0) {
      return c.json({
        success: false,
        error: 'ไม่สามารถลบหมวดหมู่ที่มีหมวดหมู่ย่อยได้ กรุณาลบหมวดหมู่ย่อยก่อน',
      }, 400);
    }
    
    // TODO: Check if category has products
    // This will be implemented when we have products table
    
    await db
      .delete(categories)
      .where(eq(categories.id, id));
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถลบหมวดหมู่ได้',
    }, 500);
  }
});

// GET /api/categories/tree/:type - Get category tree by type
categoriesRouter.get('/tree/:type', async (c) => {
  try {
    const type = c.req.param('type') as 'product' | 'service';
    
    if (!['product', 'service'].includes(type)) {
      return c.json({
        success: false,
        error: 'ประเภทหมวดหมู่ไม่ถูกต้อง',
      }, 400);
    }
    
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.type, type))
      .orderBy(categories.name);
    
    // Build tree structure
    const buildTree = (items: any[], parentId: string | null = null): any[] => {
      return items
        .filter(item => 
          parentId === null 
            ? item.parentId === null || item.parentId === undefined
            : item.parentId === parentId
        )
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    
    const tree = buildTree(allCategories);
    
    return c.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    return c.json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลโครงสร้างหมวดหมู่ได้',
    }, 500);
  }
});

export default categoriesRouter;
