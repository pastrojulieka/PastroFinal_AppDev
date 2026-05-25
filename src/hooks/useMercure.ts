import { useEffect, useRef, useCallback } from 'react';
import mercureService, { MercureEvent, MercureSubscription, MERCURE_TOPICS } from '../services/mercureService';

/**
 * Hook to subscribe to a Mercure topic and trigger a callback on events
 * Automatically unsubscribes on unmount
 */
export function useMercure<T = unknown>(
  topic: string | null,
  onEvent: (event: MercureEvent<T>) => void,
  onError?: (error: any) => void,
): void {
  const subscriptionRef = useRef<MercureSubscription | null>(null);
  const onEventRef = useRef(onEvent);
  const onErrorRef = useRef(onError);

  // Keep refs up to date without re-subscribing
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!topic) return;

    subscriptionRef.current = mercureService.subscribe<T>(
      topic,
      (event) => onEventRef.current(event),
      (error) => onErrorRef.current?.(error),
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [topic]);
}

/**
 * Hook to subscribe to product updates
 * Calls `onRefresh` whenever products are created/updated/deleted
 */
export function useMercureProducts(onRefresh: () => void): void {
  const handleEvent = useCallback((event: MercureEvent) => {
    console.log('[useMercureProducts] Product event:', event.action);
    onRefresh();
  }, [onRefresh]);

  useMercure(MERCURE_TOPICS.PRODUCTS, handleEvent);
}

/**
 * Hook to subscribe to stock updates
 * Calls `onRefresh` whenever stocks change
 */
export function useMercureStocks(onRefresh: () => void): void {
  const handleEvent = useCallback((event: MercureEvent) => {
    console.log('[useMercureStocks] Stock event:', event.action);
    onRefresh();
  }, [onRefresh]);

  useMercure(MERCURE_TOPICS.STOCKS, handleEvent);
}

/**
 * Hook to subscribe to order updates for a specific user
 * Calls `onRefresh` whenever the user's orders change
 */
export function useMercureOrders(userId: number | null, onRefresh: () => void): void {
  const topic = userId ? MERCURE_TOPICS.USER_ORDERS(userId) : null;

  const handleEvent = useCallback((event: MercureEvent) => {
    console.log('[useMercureOrders] Order event:', event.action);
    onRefresh();
  }, [onRefresh]);

  useMercure(topic, handleEvent);
}

/**
 * Hook to subscribe to profile updates for a specific user
 * Calls `onRefresh` whenever the user's profile changes
 */
export function useMercureProfile(userId: number | null, onRefresh: () => void): void {
  const topic = userId ? MERCURE_TOPICS.USER_PROFILE(userId) : null;

  const handleEvent = useCallback((event: MercureEvent) => {
    console.log('[useMercureProfile] Profile event:', event.action);
    onRefresh();
  }, [onRefresh]);

  useMercure(topic, handleEvent);
}

export default useMercure;
