import { AppState, AppStateStatus } from 'react-native';
import api from './api';
import authService from './authService';
import { Order, Product } from './types';

export type SyncPayload = {
  changed: boolean;
  version: string;
  versions: Record<string, string>;
  data?: {
    orders?: Order[];
    products?: Product[];
    stocks?: Array<{
      id: number;
      quantity: number;
      status: string;
      product_id?: number;
    }>;
    dashboard?: {
      total_revenue: number;
      total_orders_week: number;
      total_customers: number;
      total_products: number;
      total_stock: number;
    };
  };
};

type SyncListener = (payload: SyncPayload) => void;

const POLL_MS = 5000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let currentVersion: string | null = null;
let polling = false;
const listeners = new Set<SyncListener>();

async function pollOnce(): Promise<void> {
  if (polling) return;
  polling = true;

  try {
    const hasJwt = await authService.ensureServerJwt();
    if (!hasJwt) return;

    const params: Record<string, string | boolean> = { include_data: true };
    if (currentVersion) {
      params.version = currentVersion;
    }

    const response = await api.get<{
      success: boolean;
      changed: boolean;
      version: string;
      versions?: Record<string, string>;
      data?: SyncPayload['data'];
    }>('/sync', { params });

    const payload = response.data;
    if (!payload?.success) return;

    const previousVersion = currentVersion;
    currentVersion = payload.version;

    const fullPayload: SyncPayload = {
      changed: payload.changed && previousVersion !== null && previousVersion !== payload.version,
      version: payload.version,
      versions: payload.versions ?? {},
      data: payload.data,
    };

    if (fullPayload.changed) {
      listeners.forEach((listener) => listener(fullPayload));
      console.log('[Sync] Data changed, notified', listeners.size, 'listeners');
    }
  } catch (error) {
    console.log('[Sync] Poll failed:', error);
  } finally {
    polling = false;
  }
}

function startPolling(): void {
  if (pollTimer) return;
  void pollOnce();
  pollTimer = setInterval(() => void pollOnce(), POLL_MS);
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    void pollOnce();
  }
}

export const syncService = {
  start(): void {
    stopPolling();
    currentVersion = null;

    startPolling();

    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }
  },

  stop(): void {
    stopPolling();
    appStateSubscription?.remove();
    appStateSubscription = null;
    currentVersion = null;
    listeners.clear();
  },

  subscribe(listener: SyncListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  forceSync(): Promise<void> {
    return pollOnce();
  },

  getVersion(): string | null {
    return currentVersion;
  },
};

export default syncService;
