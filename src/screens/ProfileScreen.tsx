import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { customerService, authService, CustomerProfile, CustomerData } from '../services';
import { resetLogin } from '../app/reducers/auth';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await customerService.getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        const storedUser = await authService.getUser();
        if (storedUser) {
          const fallbackCustomer: CustomerData = {
            id: storedUser.id,
            name: storedUser.email.split('@')[0],
            email_address: storedUser.email,
          };
          setProfile({
            id: storedUser.id,
            email: storedUser.email,
            roles: storedUser.roles,
            customer: fallbackCustomer,
          });
        } else {
          setError(result.message || 'Failed to load profile');
        }
      }
    } catch (err) {
      const storedUser = await authService.getUser();
      if (storedUser) {
        const fallbackCustomer: CustomerData = {
          id: storedUser.id,
          name: storedUser.email.split('@')[0],
          email_address: storedUser.email,
        };
        setProfile({
          id: storedUser.id,
          email: storedUser.email,
          roles: storedUser.roles,
          customer: fallbackCustomer,
        });
      } else {
        setError('An error occurred while loading profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(resetLogin());
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffb347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={profile?.email?.charAt(0).toUpperCase() || 'U'}
          style={styles.avatar}
          color="#121212"
        />
        <Text style={styles.headerName}>
          {profile?.customer?.name || profile?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={styles.headerEmail}>{profile?.email || ''}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email || profile?.customer?.email_address || 'N/A'}</Text>
          </View>

          {profile?.customer?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{profile.customer.name}</Text>
            </View>
          )}

          {profile?.customer?.phone_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{profile.customer.phone_number}</Text>
            </View>
          )}

          {profile?.isVerified !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Verified</Text>
              <Text style={[styles.value, { color: profile.isVerified ? '#4CAF50' : '#F44336' }]}>
                {profile.isVerified ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#F44336"
        textColor="#FFFFFF"
        labelStyle={{ fontWeight: 'bold' }}
      >
        Logout
      </Button>
    </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#1E1E1E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    backgroundColor: '#ffb347',
  },
  headerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  headerEmail: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  card: {
    margin: 14,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffb347',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  label: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#DDDDDD',
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  logoutButton: {
    margin: 14,
    borderRadius: 8,
  },
});

export default ProfileScreen;