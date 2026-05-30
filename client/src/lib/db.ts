import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';

// Types for our offline database
export interface Product {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  hasVariants: boolean;
  hasLaborCost: boolean;
  basePrice?: number;
  laborPrice?: number;
  costPrice?: number;
  costMethod: 'fifo' | 'average' | 'manual';
  unitId?: string;
  sku?: string;
  barcode?: string;
  minStock: number;
  alertEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  parentId?: string;
  createdAt: Date;
}

export interface SyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  tableName: string;
  recordId: string;
  payload: any;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
}

export interface Settings {
  key: string;
  value: string;
  description?: string;
}

// Offline Database Class
export class OfflineDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  syncQueue!: Table<SyncItem>;
  settings!: Table<Settings>;

  constructor() {
    super('TireShopPOS');
    
    // Define schema
    this.version(1).stores({
      products: 'id, categoryId, name, type, sku, barcode, isActive, updatedAt',
      categories: 'id, name, type, parentId, createdAt',
      syncQueue: 'id, action, tableName, recordId, timestamp, synced',
      settings: 'key, value'
    });
  }
}

// Create database instance
export const db = new OfflineDB();

// Sync Queue Management
export class SyncQueue {
  static async addToQueue(action: 'create' | 'update' | 'delete', tableName: string, recordId: string, payload: any) {
    const syncItem: Omit<SyncItem, 'id' | 'timestamp' | 'synced' | 'retryCount'> = {
      action,
      tableName,
      recordId,
      payload
    };

    return await db.syncQueue.add({
      ...syncItem,
      id: nanoid(),
      timestamp: new Date(),
      synced: false,
      retryCount: 0
    });
  }

  static async getPendingItems() {
    return await db.syncQueue
      .filter(item => !item.synced)
      .toArray();
  }

  static async markAsSynced(id: string) {
    return await db.syncQueue.update(id, { synced: true });
  }

  static async incrementRetry(id: string) {
    const item = await db.syncQueue.get(id);
    if (item) {
      return await db.syncQueue.update(id, { 
        retryCount: item.retryCount + 1 
      });
    }
  }

  static async removeSyncedItems() {
    return await db.syncQueue
      .filter(item => item.synced)
      .delete();
  }
}

// Offline Data Access Layer
export class OfflineDAL {
  // Products
  static async getProducts() {
    return await db.products.toArray();
  }

  static async getProduct(id: string) {
    return await db.products.get(id);
  }

  static async saveProduct(product: Product) {
    const exists = await db.products.get(product.id);
    if (exists) {
      // Update existing product
      await db.products.update(product.id, product);
      // Add to sync queue
      await SyncQueue.addToQueue('update', 'products', product.id, product);
    } else {
      // Create new product
      await db.products.add(product);
      // Add to sync queue
      await SyncQueue.addToQueue('create', 'products', product.id, product);
    }
    return product;
  }

  static async deleteProduct(id: string) {
    await db.products.delete(id);
    await SyncQueue.addToQueue('delete', 'products', id, { id });
  }

  // Categories
  static async getCategories() {
    return await db.categories.toArray();
  }

  static async saveCategory(category: Category) {
    const exists = await db.categories.get(category.id);
    if (exists) {
      await db.categories.update(category.id, category);
      await SyncQueue.addToQueue('update', 'categories', category.id, category);
    } else {
      await db.categories.add(category);
      await SyncQueue.addToQueue('create', 'categories', category.id, category);
    }
    return category;
  }

  // Settings
  static async getSetting(key: string) {
    const setting = await db.settings.get(key);
    return setting?.value;
  }

  static async setSetting(key: string, value: string, description?: string) {
    const exists = await db.settings.get(key);
    if (exists) {
      await db.settings.update(key, { value, description });
    } else {
      await db.settings.add({ key, value, description });
    }
  }
}

// Initialize database
export async function initOfflineDB() {
  try {
    await db.open();
    console.log('✅ Offline database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize offline database:', error);
    throw error;
  }
}
