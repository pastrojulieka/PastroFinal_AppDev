import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { authService, orderService, Order, notificationService, orderWatchService, syncService } from '../services';
import { useMercureOrders } from '../hooks/useMercure';
import { getOrderStatusColor, getOrderStatusLabel } from '../utils/orderStatus';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOrdersWithCustomer();
    }, [])
  );

  useEffect(() => {
    authService.getUser().then((user) => {
      if (user?.id != null) {
        setUserId(Number(user.id));
      }
    });
  }, []);

  // Real-time order updates via Mercure + push notifications refresh list
  const handleOrderUpdate = useCallback(() => {
    loadOrdersWithCustomer();
  }, []);

  useMercureOrders(userId, handleOrderUpdate);

  useEffect(() => {
    return notificationService.onOrderUpdate(handleOrderUpdate);
  }, [handleOrderUpdate]);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((payload) => {
      if (payload.changed && payload.data?.orders) {
        setOrders(payload.data.orders);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    void orderWatchService.forceCheck();
  }, []);

  const loadOrdersWithCustomer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders for this customer
      const result = await orderService.getOrders(undefined);
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setError(result.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('An error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => getOrderStatusColor(status);

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
            compact
          >
            {getOrderStatusLabel(item.status)}
          </Chip>
        </View>

        {item.product_name && (
          <Text style={styles.productName}>{item.product_name}</Text>
        )}

        <View style={styles.detailsContainer}>
          {item.material && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Material</Text>
              <Text style={styles.detailValue}>{item.material}</Text>
            </View>
          )}
          {item.color && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{item.color}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit Price</Text>
            <Text style={styles.detailValue}>₱{item.price?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{item.total_amount?.toFixed(2) || '0.00'}</Text>
        </View>

        {item.date && (
          <Text style={styles.dateText}>
            Ordered: {new Date(item.date).toLocaleDateString()}
          </Text>
        )}
        {item.delivery_date && (
          <Text style={styles.dateText}>
            Delivery: {item.delivery_date}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffb347" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadOrdersWithCustomer} buttonColor="#ffb347" textColor="#121212">
          Retry
        </Button>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.emptySubtext}>Your orders will appear here after placing one</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: getOrderStatusColor('pending') }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: getOrderStatusColor('complete') }]} />
          <Text style={styles.legendText}>Complete</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: getOrderStatusColor('cancelled') }]} />
          <Text style={styles.legendText}>Cancelled</Text>
        </View>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadOrdersWithCustomer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    padding: 12,
    paddingTop: 0,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCard: {
    marginBottom: 14,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffb347',
    marginBottom: 10,
  },
  detailsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
  },
  detailValue: {
    fontSize: 13,
    color: '#DDDDDD',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffb347',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});

export default OrdersScreen;
