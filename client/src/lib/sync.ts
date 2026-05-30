import { SyncQueue } from './db';

export interface SyncResult {
  success: boolean;
  error?: string;
  itemsProcessed: number;
}

export class SyncService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds

  static async syncAll(): Promise<SyncResult> {
    try {
      const pendingItems = await SyncQueue.getPendingItems();
      
      if (pendingItems.length === 0) {
        return { success: true, itemsProcessed: 0 };
      }

      let processedCount = 0;
      const errors: string[] = [];

      for (const item of pendingItems) {
        try {
          // Skip items that have exceeded max retries
          if (item.retryCount >= this.MAX_RETRIES) {
            console.warn(`Skipping item ${item.id} - max retries exceeded`);
            continue;
          }

          // Send to server
          const success = await this.sendToServer(item);
          
          if (success) {
            await SyncQueue.markAsSynced(item.id);
            processedCount++;
          } else {
            await SyncQueue.incrementRetry(item.id);
            errors.push(`Failed to sync ${item.tableName} ${item.recordId}`);
          }

          // Add delay between requests to avoid overwhelming the server
          await this.delay(100);

        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          await SyncQueue.incrementRetry(item.id);
          errors.push(`Error syncing ${item.tableName} ${item.recordId}`);
        }
      }

      // Clean up synced items
      await SyncQueue.removeSyncedItems();

      return {
        success: errors.length === 0,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        itemsProcessed: processedCount
      };

    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
        itemsProcessed: 0
      };
    }
  }

  private static async sendToServer(item: any): Promise<boolean> {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Failed to send to server:', error);
      return false;
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auto-sync on interval
  static startAutoSync(intervalMs: number = 30000) { // 30 seconds
    setInterval(async () => {
      if (navigator.onLine) {
        const result = await this.syncAll();
        if (result.success && result.itemsProcessed > 0) {
          console.log(`✅ Synced ${result.itemsProcessed} items`);
        } else if (!result.success) {
          console.warn('⚠️ Sync failed:', result.error);
        }
      }
    }, intervalMs);
  }

  // Manual sync trigger
  static async syncNow(): Promise<SyncResult> {
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'Device is offline',
        itemsProcessed: 0
      };
    }

    return await this.syncAll();
  }

  // Get sync status
  static async getSyncStatus() {
    const pendingItems = await SyncQueue.getPendingItems();
    return {
      pendingCount: pendingItems.length,
      hasPending: pendingItems.length > 0,
      lastSyncTime: localStorage.getItem('lastSyncTime')
    };
  }
}
