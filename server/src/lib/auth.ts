import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'owner' | 'staff';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    displayName: string;
    role: 'owner' | 'staff';
  };
  token?: string;
  error?: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by username
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.username, credentials.username))
        .limit(1);

      if (userRecords.length === 0) {
        return {
          success: false,
          error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        };
      }

      const user = userRecords[0];

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'บัญชีผู้ใช้ถูกระงับการใช้งาน'
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.passwordHash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        };
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        role: user.role
      };

      const token = this.generateToken(payload);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role
        },
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่'
      };
    }
  }

  static async createUser(userData: {
    username: string;
    password: string;
    displayName: string;
    role: 'owner' | 'staff';
  }): Promise<AuthResponse> {
    try {
      // Check if username already exists
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      if (existingUsers.length > 0) {
        return {
          success: false,
          error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const newUser = {
        id: crypto.randomUUID(),
        username: userData.username,
        passwordHash,
        displayName: userData.displayName,
        role: userData.role,
        isActive: true,
        createdAt: new Date()
      };

      await db.insert(users).values(newUser);

      // Generate token for new user
      const payload: JWTPayload = {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role
      };

      const token = this.generateToken(payload);

      return {
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          displayName: newUser.displayName,
          role: newUser.role
        },
        token
      };

    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
      };
    }
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userRecords.length === 0) {
        return { success: false, error: 'ไม่พบผู้ใช้' };
      }

      const user = userRecords[0];

      // Verify old password
      const isOldPasswordValid = await this.verifyPassword(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        return { success: false, error: 'รหัสผ่านเก่าไม่ถูกต้อง' };
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, userId));

      return { success: true };

    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' };
    }
  }
}
