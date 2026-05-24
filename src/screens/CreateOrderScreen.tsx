import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService, Product, CreateOrderData } from '../services';

const CUSTOMER_NAME_KEY = 'customer_name';

const CreateOrderScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { product, stockInfo } = route.params as { product: Product; stockInfo: { status: string; color: string; inStock: boolean } };

  const [quantity, setQuantity] = useState('1');
  const [material, setMaterial] = useState(product.material || '');
  const [color, setColor] = useState(product.color || '');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = (product.price || 0) * (parseInt(quantity, 10) || 0);

  // Load saved customer name on mount
  useEffect(() => {
    const loadCustomerName = async () => {
      const savedName = await AsyncStorage.getItem(CUSTOMER_NAME_KEY);
      if (savedName) {
        setCustomerName(savedName);
      }
    };
    loadCustomerName();
  }, []);

  const handleSubmit = async () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity (at least 1).');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }

    setSubmitting(true);
    try {
      // Save customer name for future use
      await AsyncStorage.setItem(CUSTOMER_NAME_KEY, customerName.trim());

      const orderData: CreateOrderData = {
        product_id: product.id,
        quantity: qty,
        customer_name: customerName.trim(),
        material: material || undefined,
        color: color || undefined,
      };

      const result = await orderService.createOrder(orderData);
      if (result.success) {
        Alert.alert('Order Placed!', `Your order for ${product.name} has been placed successfully.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Order Failed', result.message || 'Could not place order. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.productSummary}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Product Summary</Text>
          <Text style={styles.productName}>{product.name}</Text>
          {product.description && (
            <Text style={styles.productDescription}>{product.description}</Text>
          )}
          <Text style={styles.productPrice}>₱{product.price?.toFixed(2)}</Text>
          <Text style={[styles.stockText, { color: stockInfo.color }]}>{stockInfo.status}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <TextInput
            label="Your Name *"
            value={customerName}
            onChangeText={setCustomerName}
            mode="outlined"
            style={styles.input}
            textColor="#FFFFFF"
            outlineColor="#444"
            activeOutlineColor="#ffb347"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
            placeholder="Enter your full name"
            placeholderTextColor="#555"
          />

          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor="#FFFFFF"
            outlineColor="#444"
            activeOutlineColor="#ffb347"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
          />

          <TextInput
            label="Material (optional)"
            value={material}
            onChangeText={setMaterial}
            mode="outlined"
            style={styles.input}
            textColor="#FFFFFF"
            outlineColor="#444"
            activeOutlineColor="#ffb347"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
            placeholder={product.material || 'e.g. leather'}
            placeholderTextColor="#555"
          />

          <TextInput
            label="Color (optional)"
            value={color}
            onChangeText={setColor}
            mode="outlined"
            style={styles.input}
            textColor="#FFFFFF"
            outlineColor="#444"
            activeOutlineColor="#ffb347"
            theme={{ colors: { onSurfaceVariant: '#888' } }}
            placeholder={product.color || 'e.g. white'}
            placeholderTextColor="#555"
          />
        </Card.Content>
      </Card>

      <Card style={styles.totalCard}>
        <Card.Content>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Unit Price</Text>
            <Text style={styles.totalValue}>₱{product.price?.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Quantity</Text>
            <Text style={styles.totalValue}>x{parseInt(quantity, 10) || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        style={styles.submitButton}
        buttonColor="#ffb347"
        textColor="#121212"
        labelStyle={styles.submitButtonLabel}
      >
        Place Order
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        textColor="#888"
      >
        Cancel
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 14,
    paddingBottom: 30,
  },
  productSummary: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffb347',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 20,
    color: '#ffb347',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 14,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#2A2A2A',
  },
  totalCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  totalValue: {
    fontSize: 14,
    color: '#DDDDDD',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffb347',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 8,
    borderColor: '#444',
    marginBottom: 20,
  },
});

export default CreateOrderScreen;
