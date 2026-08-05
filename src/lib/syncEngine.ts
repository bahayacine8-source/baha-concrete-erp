import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';
import { SyncQueueItem, SyncOperation, SyncItemStatus } from '../types';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTimestamp: string | null;
  pendingOfflineChangesCount: number;
  syncInProgress: boolean;
  deviceId: string;
  syncedQueueCount: number;
  conflictQueueCount: number;
}

export class OfflineSyncEngine {
  private static instance: OfflineSyncEngine;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private deviceId: string;
  private queue: SyncQueueItem[] = [];
  private listeners: Array<(status: SyncStatus) => void> = [];

  private constructor() {
    this.deviceId = this.initDeviceId();
    this.loadQueueFromLocalStorage();

    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  public static getInstance(): OfflineSyncEngine {
    if (!OfflineSyncEngine.instance) {
      OfflineSyncEngine.instance = new OfflineSyncEngine();
    }
    return OfflineSyncEngine.instance;
  }

  private initDeviceId(): string {
    let id = localStorage.getItem('baha_device_id');
    if (!id) {
      id = `dev_pc_${Math.floor(100 + Math.random() * 900)}_${Date.now().toString(36)}`;
      localStorage.setItem('baha_device_id', id);
    }
    return id;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  private loadQueueFromLocalStorage() {
    try {
      const saved = localStorage.getItem('baha_sync_queue');
      this.queue = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load sync_queue from LocalStorage/SQLite:', e);
      this.queue = [];
    }
  }

  private saveQueueToLocalStorage() {
    try {
      localStorage.setItem('baha_sync_queue', JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to save sync_queue:', e);
    }
  }

  public subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    callback(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    this.notifyListeners();
    if (online) {
      this.processSyncQueue();
    }
  }

  public getStatus(): SyncStatus {
    const pendingCount = this.queue.filter((item) => item.status === 'pending').length;
    const syncedCount = this.queue.filter((item) => item.status === 'synced').length;
    const conflictCount = this.queue.filter((item) => item.status === 'conflict').length;

    return {
      isOnline: this.isOnline,
      lastSyncTimestamp: localStorage.getItem('baha_last_sync_time'),
      pendingOfflineChangesCount: pendingCount,
      syncedQueueCount: syncedCount,
      conflictQueueCount: conflictCount,
      syncInProgress: this.syncInProgress,
      deviceId: this.deviceId,
    };
  }

  public getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  /**
    Enqueues a database mutation into the `sync_queue` table/store when offline or for background sync.
    Passwords and sensitive fields are strictly stripped to meet security criteria.
   */
  public enqueueOperation(params: {
    tableName: string;
    recordId: string;
    operation: SyncOperation;
    payload: any;
    companyId: string;
    updatedAt?: string;
  }): SyncQueueItem {
    const now = new Date().toISOString();

    // Sanitize payload: NEVER store passwords locally
    const sanitizedPayload = { ...params.payload };
    if (sanitizedPayload.password) delete sanitizedPayload.password;
    if (sanitizedPayload.pass) delete sanitizedPayload.pass;

    const queueItem: SyncQueueItem = {
      id: `sq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deviceId: this.deviceId,
      tableName: params.tableName,
      recordId: params.recordId,
      operation: params.operation,
      status: 'pending',
      createdAt: now,
      syncedAt: null,
      payload: sanitizedPayload,
      updatedAt: params.updatedAt || sanitizedPayload.updatedAt || now,
      companyId: params.companyId,
    };

    this.queue.unshift(queueItem);
    this.saveQueueToLocalStorage();
    this.notifyListeners();

    if (this.isOnline) {
      this.processSyncQueue();
    }

    return queueItem;
  }

  /**
    Triggers uploading pending sync_queue items to Firebase Firestore with timestamp-based conflict resolution.
   */
  public async processSyncQueue(): Promise<{ syncedCount: number; conflictCount: number }> {
    if (this.syncInProgress || !this.isOnline) {
      return { syncedCount: 0, conflictCount: 0 };
    }

    const pendingItems = this.queue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) {
      return { syncedCount: 0, conflictCount: 0 };
    }

    this.syncInProgress = true;
    this.notifyListeners();

    let syncedCount = 0;
    let conflictCount = 0;

    try {
      for (const item of pendingItems) {
        if (!this.isOnline) break;

        const docRef = doc(
          db,
          COLLECTIONS.COMPANIES,
          item.companyId,
          item.tableName,
          item.recordId
        );

        try {
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            const remoteTime = new Date(
              remoteData?.updatedAt || remoteData?.createdAt || '1970-01-01T00:00:00.000Z'
            ).getTime();
            const localTime = new Date(item.updatedAt || item.createdAt).getTime();

            if (localTime >= remoteTime) {
              // Local is newer or equal -> Push to Firebase
              await setDoc(docRef, item.payload, { merge: true });
              item.status = 'synced';
              item.syncedAt = new Date().toISOString();
              syncedCount++;
            } else {
              // Remote is newer -> Conflict detected! Resolve by adopting remote or flagging conflict
              item.status = 'conflict';
              item.syncedAt = new Date().toISOString();
              conflictCount++;
            }
          } else {
            // Document does not exist remotely -> Push
            await setDoc(docRef, item.payload, { merge: true });
            item.status = 'synced';
            item.syncedAt = new Date().toISOString();
            syncedCount++;
          }
        } catch (itemError) {
          console.warn(`Failed to sync item ${item.id} to Firestore:`, itemError);
          item.status = 'failed';
        }
      }

      localStorage.setItem('baha_last_sync_time', new Date().toISOString());
    } catch (err) {
      console.error('Error during processSyncQueue execution:', err);
    } finally {
      this.syncInProgress = false;
      this.saveQueueToLocalStorage();
      this.notifyListeners();
    }

    return { syncedCount, conflictCount };
  }

  public clearSyncedItems() {
    this.queue = this.queue.filter((i) => i.status !== 'synced');
    this.saveQueueToLocalStorage();
    this.notifyListeners();
  }

  private notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach((cb) => cb(status));
  }
}

export const syncEngine = OfflineSyncEngine.getInstance();
