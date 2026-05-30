import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuthService, LoginRequest } from '../lib/auth';

const auth = new Hono();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, 'กรุณาระบุชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน')
});

// Create user schema
const createUserSchema = z.object({
  username: z.string().min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  displayName: z.string().min(1, 'กรุณาระบุชื่อแสดง'),
  role: z.enum(['owner', 'staff'])
});

// Change password schema
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'กรุณาระบุรหัสผ่านเก่า'),
  newPassword: z.string().min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
});

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const credentials = c.req.valid('json') as LoginRequest;
  
  const result = await AuthService.login(credentials);
  
  if (result.success) {
    return c.json({
      success: true,
      user: result.user,
      token: result.token
    });
  } else {
    return c.json({
      success: false,
      error: result.error
    }, 401);
  }
});

// POST /api/auth/register
auth.post('/register', zValidator('json', createUserSchema), async (c) => {
  const userData = c.req.valid('json');
  
  const result = await AuthService.createUser(userData);
  
  if (result.success) {
    return c.json({
      success: true,
      user: result.user,
      token: result.token
    });
  } else {
    return c.json({
      success: false,
      error: result.error
    }, 400);
  }
});

// POST /api/auth/change-password
auth.post('/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const { oldPassword, newPassword } = c.req.valid('json');
  
  // Get user ID from token (should implement middleware for this)
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'ไม่พบ Authorization token' }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = AuthService.verifyToken(token);
  
  if (!payload) {
    return c.json({ success: false, error: 'Token ไม่ถูกต้อง' }, 401);
  }
  
  const result = await AuthService.changePassword(payload.userId, oldPassword, newPassword);
  
  if (result.success) {
    return c.json({ success: true });
  } else {
    return c.json({
      success: false,
      error: result.error
    }, 400);
  }
});

// GET /api/auth/me
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'ไม่พบ Authorization token' }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = AuthService.verifyToken(token);
  
  if (!payload) {
    return c.json({ success: false, error: 'Token ไม่ถูกต้อง' }, 401);
  }
  
  return c.json({
    success: true,
    user: {
      id: payload.userId,
      username: payload.username,
      role: payload.role
    }
  });
});

export default auth;
