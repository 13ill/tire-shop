import { z } from 'zod';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'owner' | 'staff';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  // Get stored auth state
  static getStoredAuth(): { token: string | null; user: User | null } {
    if (typeof window === 'undefined') {
      return { token: null, user: null };
    }

    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;

      return { token, user };
    } catch (error) {
      console.error('Error reading stored auth:', error);
      return { token: null, user: null };
    }
  }

  // Store auth state
  static storeAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  }

  // Clear auth state
  static clearAuth(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Login API call
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        this.storeAuth(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          error: data.error || 'การเข้าสู่ระบบล้มเหลว',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      };
    }
  }

  // Register API call
  static async register(userData: {
    username: string;
    password: string;
    displayName: string;
    role: 'owner' | 'staff';
  }): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        this.storeAuth(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          error: data.error || 'การสร้างบัญชีล้มเหลว',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      };
    }
  }

  // Get current user from token
  static async getCurrentUser(): Promise<User | null> {
    const { token } = this.getStoredAuth();
    
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }

    // If token is invalid, clear it
    this.clearAuth();
    return null;
  }

  // Change password
  static async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const { token } = this.getStoredAuth();
    
    if (!token) {
      return { success: false, error: 'ไม่พบ token' };
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'เปลี่ยนรหัสผ่านล้มเหลว',
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      };
    }
  }

  // Logout
  static logout(): void {
    this.clearAuth();
  }

  // Get auth headers for API calls
  static getAuthHeaders(): Record<string, string> {
    const { token } = this.getStoredAuth();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
    };
  }
}

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณาระบุชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  displayName: z.string().min(1, 'กรุณาระบุชื่อแสดง'),
  role: z.enum(['owner', 'staff']),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'กรุณาระบุรหัสผ่านเก่า'),
  newPassword: z.string().min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'),
});
