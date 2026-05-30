import { AppState, AppStateStatus } from 'react-native';
import api from './api';
import authService from './authService';
import notificationService, { showOrderStatusNotification } from './notificationService';
import syncService, { SyncPayload } from './syncService';
import { Order } from './types';
import { normalizeOrderStatus } from '../utils/orderStatus';

let appStateSubscription: { remove: () => void } | null = null;
let unsubscribeSync: (() => void) | null = null;
let lastOrderStatuses: Record<number, string> = {};
let statusesInitialized = false;

function findStatusChangedOrder(orders: Order[]): { order: Order; previousStatus: string } | null {
  let changed: { order: Order; previousStatus: string } | null = null;

  for (const order of orders) {
    const id = Number(order.id);
    const status = normalizeOrderStatus(order.status);

    if (statusesInitialized && lastOrderStatuses[id] !== undefined && lastOrderStatuses[id] !== status) {
      changed = { order: { ...order, status }, previousStatus: lastOrderStatuses[id] };
    }

    lastOrderStatuses[id] = status;
  }

  statusesInitialized = true;
  return changed;
}

async function bootstrapOrderStatuses(): Promise<void> {
  try {
    const hasJwt = await authService.ensureServerJwt();
    if (!hasJwt) {
      return;
    }

    const response = await api.get<{ success: boolean; data?: Order[] }>('/orders');
    const orders = response.data?.data;
    if (Array.isArray(orders)) {
      findStatusChangedOrder(orders);
    }
  } catch (error) {
    console.log('[OrderWatch] Bootstrap failed:', error);
  }
}

async function handleSyncPayload(payload: SyncPayload): Promise<void> {
  const orders = payload.data?.orders;
  if (!orders?.length) {
    return;
  }

  const statusChange = findStatusChangedOrder(orders);

  if (statusChange && payload.changed) {
    await showOrderStatusNotification(statusChange.order, statusChange.previousStatus);
    notificationService.notifyOrderUpdateListeners();
    console.log(
      '[OrderWatch] Status change:',
      statusChange.order.id,
      statusChange.previousStatus,
      '→',
      statusChange.order.status
    );
  } else if (payload.changed) {
    notificationService.notifyOrderUpdateListeners();
  }
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    void syncService.forceSync();
  }
}

export const orderWatchService = {
  start: (): void => {
    lastOrderStatuses = {};
    statusesInitialized = false;

    syncService.start();
    void bootstrapOrderStatuses();

    if (!unsubscribeSync) {
      unsubscribeSync = syncService.subscribe((payload) => {
        void handleSyncPayload(payload);
      });
    }

    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }
  },

  stop: (): void => {
    unsubscribeSync?.();
    unsubscribeSync = null;
    syncService.stop();
    appStateSubscription?.remove();
    appStateSubscription = null;
    lastOrderStatuses = {};
    statusesInitialized = false;
  },

  forceCheck: async (): Promise<void> => {
    await syncService.forceSync();
  },
};

export default orderWatchService;
