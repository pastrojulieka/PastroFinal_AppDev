export type OrderStatusValue = 'pending' | 'complete' | 'cancelled';

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  pending: 'Pending',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatusValue, string> = {
  pending: '#FF9800',
  complete: '#4CAF50',
  cancelled: '#F44336',
};

export function normalizeOrderStatus(status?: string): OrderStatusValue {
  const value = (status || 'pending').toLowerCase();
  if (value === 'complete' || value === 'completed' || value === 'delivered') {
    return 'complete';
  }
  if (value === 'cancelled' || value === 'canceled') {
    return 'cancelled';
  }
  return 'pending';
}

export function getOrderStatusLabel(status?: string): string {
  return STATUS_LABELS[normalizeOrderStatus(status)];
}

export function getOrderStatusColor(status?: string): string {
  return STATUS_COLORS[normalizeOrderStatus(status)];
}
