import EventSource from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Mercure Hub URL - update this to match your Docker Mercure service
const MERCURE_HUB_URL = 'http://192.168.196.186:9090/.well-known/mercure';

// Event types published by the backend
export interface MercureEvent<T = unknown> {
  type: 'product' | 'stock' | 'order' | 'profile';
  action: 'created' | 'updated' | 'deleted';
  data: T;
  timestamp: string;
}

// Subscription handle returned to callers
export interface MercureSubscription {
  unsubscribe: () => void;
}

// Topics matching the backend publisher
export const MERCURE_TOPICS = {
  PRODUCTS: '/api/products',
  STOCKS: '/api/stocks',
  USER_ORDERS: (userId: number) => `/api/users/${userId}/orders`,
  USER_PROFILE: (userId: number) => `/api/users/${userId}/profile`,
};

type EventCallback<T = unknown> = (event: MercureEvent<T>) => void;
type ErrorCallback = (error: any) => void;

interface SubscriptionEntry {
  topic: string;
  callback: EventCallback;
  onError?: ErrorCallback;
}

class MercureService {
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, SubscriptionEntry[]> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second
  private isConnected = false;
  private subscriberToken: string | null = null;
  private lastEventId: string | null = null;

  /**
   * Fetch a subscriber JWT from the backend for private topics
   */
  async fetchSubscriberToken(): Promise<string | null> {
    try {
      const response = await api.get<{ hub_url: string; token: string }>('/mercure-auth');
      this.subscriberToken = response.data.token;
      return this.subscriberToken;
    } catch (error) {
      console.log('[Mercure] Failed to fetch subscriber token:', error);
      return null;
    }
  }

  /**
   * Subscribe to a Mercure topic
   */
  subscribe<T = unknown>(
    topic: string,
    callback: EventCallback<T>,
    onError?: ErrorCallback,
  ): MercureSubscription {
    const id = `${topic}_${Date.now()}_${Math.random()}`;

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }

    const entry: SubscriptionEntry = {
      topic,
      callback: callback as EventCallback,
      onError,
    };
    this.subscriptions.get(topic)!.push(entry);

    // Reconnect with new topic if already connected
    this.reconnect();

    return {
      unsubscribe: () => {
        const entries = this.subscriptions.get(topic);
        if (entries) {
          const idx = entries.indexOf(entry);
          if (idx !== -1) entries.splice(idx, 1);
          if (entries.length === 0) {
            this.subscriptions.delete(topic);
            // Reconnect without this topic
            this.reconnect();
          }
        }
      },
    };
  }

  /**
   * Connect or reconnect to Mercure hub with all current topics (debounced)
   */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private reconnect(): void {
    // Debounce: multiple hooks subscribe at mount time, wait for all to register
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      // Close existing connection
      this.disconnect();

      const topics = Array.from(this.subscriptions.keys());
      if (topics.length === 0) {
        console.log('[Mercure] No subscriptions, not connecting');
        return;
      }

      console.log('[Mercure] Subscribing to topics:', topics);
      this.connect(topics);
    }, 300);
  }

  /**
   * Build the Mercure subscription URL with topics
   * Note: URLSearchParams is not reliably available in React Native, so build manually
   */
  private buildUrl(topics: string[]): string {
    const parts = topics.map(t => `topic=${encodeURIComponent(t)}`);
    if (this.lastEventId) {
      parts.push(`Last-Event-ID=${encodeURIComponent(this.lastEventId)}`);
    }
    return `${MERCURE_HUB_URL}?${parts.join('&')}`;
  }

  /**
   * Establish SSE connection to Mercure hub
   */
  private connect(topics: string[]): void {
    const url = this.buildUrl(topics);
    console.log('[Mercure] Connecting to:', url);

    const headers: Record<string, string> = {};
    if (this.subscriberToken) {
      headers['Authorization'] = `Bearer ${this.subscriberToken}`;
    }

    this.eventSource = new EventSource(url, {
      headers,
      method: 'GET',
    });

    this.eventSource.addEventListener('open', () => {
      console.log('[Mercure] Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.eventSource.addEventListener('message', (event: any) => {
      try {
        if (!event.data) return;

        // Store last event ID for reconnection
        if (event.lastEventId) {
          this.lastEventId = event.lastEventId;
        }

        const parsed: MercureEvent = JSON.parse(event.data);
        console.log('[Mercure] Event received:', parsed.type, parsed.action, JSON.stringify(parsed.data));

        // Dispatch to all subscribers
        // Mercure hub already filters events by subscribed topics,
        // so every event received is relevant to at least one subscription
        this.subscriptions.forEach((entries, topic) => {
          const topicMatches = this.eventMatchesTopic(parsed, topic);
          if (topicMatches) {
            console.log('[Mercure] Dispatching to topic:', topic, '- listeners:', entries.length);
            entries.forEach(entry => entry.callback(parsed));
          }
        });
      } catch (error) {
        console.log('[Mercure] Error parsing event:', error);
      }
    });

    this.eventSource.addEventListener('error', (error: any) => {
      console.log('[Mercure] Connection error:', JSON.stringify(error));
      this.isConnected = false;

      // Notify error callbacks
      this.subscriptions.forEach((entries) => {
        entries.forEach(entry => entry.onError?.(error));
      });

      // Auto-reconnect with exponential backoff
      this.scheduleReconnect();
    });
  }

  /**
   * Match an incoming event to a subscribed topic
   */
  private eventMatchesTopic(event: MercureEvent, topic: string): boolean {
    if (event.type === 'product' && topic === MERCURE_TOPICS.PRODUCTS) return true;
    if (event.type === 'stock' && topic === MERCURE_TOPICS.STOCKS) return true;
    if (event.type === 'order' && topic.includes('/orders')) return true;
    if (event.type === 'profile' && topic.includes('/profile')) return true;
    return false;
  }

  /**
   * Schedule a reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Mercure] Max reconnect attempts reached');
      return;
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`[Mercure] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      const topics = Array.from(this.subscriptions.keys());
      if (topics.length > 0) {
        this.connect(topics);
      }
    }, delay);
  }

  /**
   * Disconnect from Mercure hub
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.removeAllEventListeners();
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }

  /**
   * Disconnect and clear all subscriptions
   */
  destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.lastEventId = null;
    this.subscriberToken = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if currently connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get count of active subscriptions
   */
  getSubscriptionCount(): number {
    let count = 0;
    this.subscriptions.forEach(entries => { count += entries.length; });
    return count;
  }
}

// Singleton instance
const mercureService = new MercureService();
export default mercureService;
