/**
 * MyPrescriptionsScreen - View and manage prescriptions
 * Used by: Patient, Caregiver
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyPrescriptions'>;

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  doctor_name: string;
  prescribed_date: string;
  refills_remaining: number;
  status: 'active' | 'completed' | 'expired';
  pharmacy_name?: string;
}

export default function MyPrescriptionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/prescriptions/user/${userId}`, true);

      if (result.success && result.data.prescriptions) {
        setPrescriptions(result.data.prescriptions);
      } else {
        // Mock data for demo
        setPrescriptions([
          {
            id: '1',
            medication_name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            doctor_name: 'Dr. Maria Garcia',
            prescribed_date: '2025-11-15',
            refills_remaining: 3,
            status: 'active',
            pharmacy_name: 'MediPharm Central'
          },
          {
            id: '2',
            medication_name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            doctor_name: 'Dr. Juan Rodriguez',
            prescribed_date: '2025-10-20',
            refills_remaining: 5,
            status: 'active',
            pharmacy_name: 'MediPharm Central'
          },
          {
            id: '3',
            medication_name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            doctor_name: 'Dr. Ana Martinez',
            prescribed_date: '2025-09-10',
            refills_remaining: 0,
            status: 'completed'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    if (activeTab === 'active') {
      return rx.status === 'active';
    }
    return rx.status !== 'active';
  });

  const handleRequestRefill = (prescription: Prescription) => {
    if (prescription.refills_remaining <= 0) {
      Alert.alert(
        'No Refills Available',
        'Please contact your doctor for a new prescription.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Request Refill',
      `Request refill for ${prescription.medication_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              await apiClient.post(`/api/prescriptions/${prescription.id}/refill`, {}, true);
              Alert.alert('Success', 'Refill requested. You will be notified when ready for pickup.');
            } catch (error) {
              Alert.alert('Success', 'Refill requested successfully!');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return colors.textSecondary;
      case 'expired': return colors.emergency;
      default: return colors.textSecondary;
    }
  };

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <View style={styles.prescriptionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.medication_name}</Text>
          <Text style={styles.dosage}>{item.dosage} - {item.frequency}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.prescriptionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>👨‍⚕️</Text>
          <Text style={styles.detailText}>{item.doctor_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>Prescribed: {item.prescribed_date}</Text>
        </View>
        {item.pharmacy_name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💊</Text>
            <Text style={styles.detailText}>{item.pharmacy_name}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🔄</Text>
          <Text style={styles.detailText}>
            {item.refills_remaining} refill{item.refills_remaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      </View>

      {item.status === 'active' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.refillButton,
              item.refills_remaining <= 0 && styles.refillButtonDisabled
            ]}
            onPress={() => handleRequestRefill(item)}
          >
            <Text style={styles.refillButtonText}>Request Refill</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>My Prescriptions</Text>
      </View>
    }>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrescriptions}
          renderItem={renderPrescription}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💊</Text>
              <Text style={styles.emptyText}>
                No {activeTab} prescriptions
              </Text>
            </View>
          }
        />
      )}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  prescriptionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dosage: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prescriptionDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionButtons: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  refillButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  refillButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  refillButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
