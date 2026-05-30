import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus, EventType } from '@notifee/react-native';
import api from './api';
import authService from './authService';
import { Order } from './types';
import { getOrderStatusLabel, normalizeOrderStatus } from '../utils/orderStatus';

const ORDERS_CHANNEL_ID = 'orders';

let initialized = false;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeNotifee: (() => void) | null = null;
const orderUpdateListeners = new Set<() => void>();

function notifyOrderUpdateListeners(): void {
  orderUpdateListeners.forEach((listener) => listener());
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: ORDERS_CHANNEL_ID,
    name: 'Order Updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) >= 33) {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    }
    return true;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function registerTokenWithServer(token: string): Promise<void> {
  try {
    const hasJwt = await authService.ensureServerJwt();
    if (!hasJwt) {
      return;
    }
    await api.post('/device-token', { token });
    console.log('[Push] Device token registered with server');
  } catch (error) {
    console.log('[Push] Failed to register device token:', error);
  }
}

export async function showOrderStatusNotification(
  order?: Partial<Order>,
  previousStatus?: string
): Promise<void> {
  await ensureAndroidChannel();

  const status = normalizeOrderStatus(order?.status);
  const title = 'Order Status Updated';
  const body = order?.id
    ? previousStatus && normalizeOrderStatus(previousStatus) !== status
      ? `Order #${order.id}${order.product_name ? ` (${order.product_name})` : ''} changed from ${getOrderStatusLabel(previousStatus)} to ${getOrderStatusLabel(status)}.`
      : `Order #${order.id}${order.product_name ? ` (${order.product_name})` : ''} is now ${getOrderStatusLabel(status)}.`
    : 'Your order status was updated. Open the app for details.';

  await notifee.displayNotification({
    id: order?.id ? `order-${order.id}-${Date.now()}` : `order-${Date.now()}`,
    title,
    body,
    android: {
      channelId: ORDERS_CHANNEL_ID,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
      sound: 'default',
    },
    data: {
      type: 'order_status_changed',
      orderId: order?.id ? String(order.id) : '',
      status,
      previousStatus: previousStatus ?? '',
    },
  });
}

function buildMessageFromData(data?: Record<string, string>): { title: string; body: string } | null {
  if (!data || data.type !== 'order_status_changed') {
    return null;
  }

  const orderId = data.orderId;
  const status = normalizeOrderStatus(data.status);
  const previousStatus = data.previousStatus ? normalizeOrderStatus(data.previousStatus) : null;

  if (!orderId) {
    return {
      title: 'Order Status Updated',
      body: `Your order is now ${getOrderStatusLabel(status)}.`,
    };
  }

  if (previousStatus && previousStatus !== status) {
    return {
      title: 'Order Status Updated',
      body: `Order #${orderId} changed from ${getOrderStatusLabel(previousStatus)} to ${getOrderStatusLabel(status)}.`,
    };
  }

  return {
    title: 'Order Status Updated',
    body: `Order #${orderId} is now ${getOrderStatusLabel(status)}.`,
  };
}

async function displayRemoteNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  const fromData = buildMessageFromData(remoteMessage.data as Record<string, string> | undefined);
  const title = remoteMessage.notification?.title ?? fromData?.title ?? 'Order Status Updated';
  const body =
    remoteMessage.notification?.body ??
    fromData?.body ??
    'Your order was updated by the admin.';

  await ensureAndroidChannel();
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: ORDERS_CHANNEL_ID,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
      sound: 'default',
    },
    data: remoteMessage.data,
  });
}

export async function handleBackgroundRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  await displayRemoteNotification(remoteMessage);
}

export const notificationService = {
  initialize: async (): Promise<void> => {
    await ensureAndroidChannel();

    const permitted = await requestNotificationPermission();
    if (!permitted) {
      console.log('[Push] Notification permission not granted yet');
    }

    try {
      const token = await messaging().getToken();
      if (token) {
        await registerTokenWithServer(token);
      }
    } catch (error) {
      console.log('[Push] Failed to get FCM token:', error);
    }

    if (!initialized) {
      unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        await displayRemoteNotification(remoteMessage);
        notifyOrderUpdateListeners();
      });

      unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
        await registerTokenWithServer(newToken);
      });

      unsubscribeNotifee = notifee.onForegroundEvent(({ type }) => {
        if (type === EventType.PRESS) {
          notifyOrderUpdateListeners();
        }
      });

      initialized = true;
    }
  },

  registerDeviceToken: async (): Promise<void> => {
    try {
      const token = await messaging().getToken();
      if (token) {
        await registerTokenWithServer(token);
      }
    } catch (error) {
      console.log('[Push] registerDeviceToken failed:', error);
    }
  },

  onOrderUpdate: (listener: () => void): (() => void) => {
    orderUpdateListeners.add(listener);
    return () => {
      orderUpdateListeners.delete(listener);
    };
  },

  notifyOrderUpdateListeners,

  shutdown: (): void => {
    unsubscribeForeground?.();
    unsubscribeTokenRefresh?.();
    unsubscribeNotifee?.();
    unsubscribeForeground = null;
    unsubscribeTokenRefresh = null;
    unsubscribeNotifee = null;
    initialized = false;
  },
};

export default notificationService;
