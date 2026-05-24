import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { productService, stockService, Product, Stock } from '../services';
import { ROUTES } from '../utils';

const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Record<string, Stock>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductsAndStocks();
  }, []);

  const loadProductsAndStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsResult, stocksResult] = await Promise.all([
        productService.getProducts(),
        stockService.getAllStocks(),
      ]);

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data);
      } else {
        setError(productsResult.message || 'Failed to load products');
      }

      if (stocksResult.success && stocksResult.data) {
        const stockMap: Record<string, Stock> = {};
        stocksResult.data.forEach((stock: Stock) => {
          if (stock.product?.id) {
            stockMap[String(stock.product.id)] = stock;
          }
        });
        setStocks(stockMap);
      }
    } catch (err) {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product): { status: string; color: string; inStock: boolean } => {
    const stock = stocks[String(product.id)];
    if (stock) {
      const s = stock.status;
      const qty = stock.quantity ?? 0;
      if (s === 'In Stock') return { status: `In Stock (${qty})`, color: '#4CAF50', inStock: true };
      if (s === 'Low Stock') return { status: `Low Stock (${qty})`, color: '#FF9800', inStock: true };
      if (s === 'Out of Stock') return { status: 'Out of Stock', color: '#F44336', inStock: false };
    }
    const s = product.stockStatus;
    if (s === 'In Stock' || s === 'in_stock') return { status: 'In Stock', color: '#4CAF50', inStock: true };
    if (s === 'Low Stock' || s === 'low_stock') return { status: 'Low Stock', color: '#FF9800', inStock: true };
    if (s === 'Out of Stock' || s === 'out_of_stock') return { status: 'Out of Stock', color: '#F44336', inStock: false };
    return { status: 'Out of Stock', color: '#F44336', inStock: false };
  };

  const handleOrder = (product: Product) => {
    const stock = getStockStatus(product);
    navigation.navigate(ROUTES.CREATE_ORDER, { product, stockInfo: stock });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stock = getStockStatus(item);
    return (
      <Card style={styles.productCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.productName}>{item.name}</Text>
            <Chip
              style={[styles.stockChip, { backgroundColor: stock.color }]}
              textStyle={styles.stockChipText}
              compact
            >
              {stock.status}
            </Chip>
          </View>

          {item.description && (
            <Text style={styles.productDescription}>{item.description}</Text>
          )}

          <Text style={styles.productPrice}>₱{item.price?.toFixed(2) || '0.00'}</Text>

          <View style={styles.specsContainer}>
            {item.material && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Material</Text>
                <Text style={styles.specValue}>{item.material}</Text>
              </View>
            )}
            {item.color && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Color</Text>
                <Text style={styles.specValue}>{item.color}</Text>
              </View>
            )}
          </View>

          {item.categories && item.categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {item.categories.map((cat) => (
                <Chip
                  key={cat.id}
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  compact
                >
                  {cat.name}
                </Chip>
              ))}
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => handleOrder(item)}
            style={styles.orderButton}
            buttonColor="#ffb347"
            textColor="#121212"
            disabled={!stock.inStock}
          >
            {stock.inStock ? 'Order Now' : 'Out of Stock'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffb347" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadProductsAndStocks} buttonColor="#ffb347" textColor="#121212">
          Retry
        </Button>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No products available</Text>
        <Text style={styles.emptySubtext}>Check back later for new products</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadProductsAndStocks}
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
  },
  list: {
    padding: 12,
  },
  productCard: {
    marginBottom: 14,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  stockChip: {
    height: 28,
  },
  stockChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 12,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 24,
    color: '#ffb347',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  specsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    color: '#DDDDDD',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#333',
    height: 28,
  },
  categoryChipText: {
    color: '#ffb347',
    fontSize: 11,
  },
  orderButton: {
    borderRadius: 8,
    marginTop: 4,
  },
});

export default ProductsScreen;
