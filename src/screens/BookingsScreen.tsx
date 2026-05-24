import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Card, Text, Button, Chip, Modal, Portal, TextInput } from 'react-native-paper';
import { bookingService, Booking, CreateBookingData } from '../services';

const BookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingService.getBookings();
      if (result.success && result.data) {
        setBookings(result.data);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setServiceType('');
    setBookingDate('');
    setNotes('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleCreateBooking = async () => {
    if (!serviceType || !bookingDate) {
      Alert.alert('Missing Fields', 'Please enter service type and booking date');
      return;
    }

    // Validate date format (simple check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingDate)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    setCreating(true);
    try {
      const bookingData: CreateBookingData = {
        serviceType,
        bookingDate: `${bookingDate}T10:00:00Z`, // Add time component
        notes: notes || undefined,
      };
      const result = await bookingService.createBooking(bookingData);
      if (result.success) {
        Alert.alert('Success', 'Booking created successfully');
        closeModal();
        loadBookings(); // Refresh list
      } else {
        Alert.alert('Error', result.message || 'Failed to create booking');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while creating booking');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <Card style={styles.bookingCard}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: 'white' }}
          >
            {item.status}
          </Chip>
        </View>
        <Text style={styles.bookingDate}>
          {new Date(item.bookingDate).toLocaleDateString()} at{' '}
          {new Date(item.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            Notes: {item.notes}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffb347" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadBookings} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id?.toString() || item['@id'] || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadBookings}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create a new booking</Text>
          </View>
        }
      />
      <Button
        mode="contained"
        onPress={openModal}
        style={styles.createButton}
        icon="plus"
      >
        Create New Booking
      </Button>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Create New Booking</Text>
          <ScrollView>
            <TextInput
              label="Service Type *"
              value={serviceType}
              onChangeText={setServiceType}
              placeholder="e.g., Consultation, Repair, etc."
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Booking Date (YYYY-MM-DD) *"
              value={bookingDate}
              onChangeText={setBookingDate}
              placeholder="2024-12-25"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional information..."
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            <View style={styles.buttonRow}>
              <Button onPress={closeModal} style={styles.button} textColor="#666">
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateBooking}
                style={[styles.button, styles.createButtonModal]}
                loading={creating}
                disabled={creating}
              >
                Create
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ffb347',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  list: {
    padding: 15,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: 15,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffb347',
    paddingVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  createButtonModal: {
    backgroundColor: '#ffb347',
  },
});

export default BookingsScreen;
