/**
 * LabOrderDetailsScreen - View and process lab order
 * Used by: Lab Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'LabOrderDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'LabOrderDetails'>;

export default function LabOrderDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;

  const [status, setStatus] = useState<'pending' | 'sample_collected' | 'processing' | 'completed'>('pending');

  // Mock order data
  const order = {
    id: orderId,
    patient_name: 'John Doe',
    patient_dob: '1980-05-15',
    patient_phone: '+593987654321',
    ordering_doctor: 'Dr. Maria Garcia',
    order_date: '2025-12-05',
    priority: 'routine' as 'routine' | 'urgent',
    tests: [
      { name: 'Complete Blood Count (CBC)', code: 'CBC001' },
      { name: 'Basic Metabolic Panel', code: 'BMP001' },
      { name: 'Lipid Panel', code: 'LIP001' }
    ],
    special_instructions: 'Patient should be fasting for 8 hours before sample collection.'
  };

  const handleStatusUpdate = (newStatus: typeof status) => {
    setStatus(newStatus);

    if (newStatus === 'sample_collected') {
      Alert.alert('Sample Collected', 'Sample has been collected and logged.');
    } else if (newStatus === 'processing') {
      Alert.alert('Processing Started', 'Tests are now being processed.');
    } else if (newStatus === 'completed') {
      navigation.navigate('ResultsEntry', { orderId });
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return '#FFA500';
      case 'sample_collected': return '#2196F3';
      case 'processing': return colors.accent;
      case 'completed': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Lab Order</Text>
      </View>
    }>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(status) }]}>
        <Text style={styles.statusText}>{status.replace('_', ' ').toUpperCase()}</Text>
      </View>

      {/* Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date:</Text>
            <Text style={styles.infoValue}>{order.order_date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority:</Text>
            <View style={[styles.priorityBadge, order.priority === 'urgent' && styles.urgentBadge]}>
              <Text style={styles.priorityText}>{order.priority.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ordering Doctor:</Text>
            <Text style={styles.infoValue}>{order.ordering_doctor}</Text>
          </View>
        </View>
      </View>

      {/* Patient Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.patientName}>{order.patient_name}</Text>
          <Text style={styles.patientDetail}>DOB: {order.patient_dob}</Text>
          <Text style={styles.patientDetail}>Phone: {order.patient_phone}</Text>
        </View>
      </View>

      {/* Tests Ordered */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tests Ordered</Text>
        {order.tests.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testCode}>Code: {test.code}</Text>
          </View>
        ))}
      </View>

      {/* Special Instructions */}
      {order.special_instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{order.special_instructions}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {status === 'pending' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate('sample_collected')}
          >
            <Text style={styles.actionButtonText}>Mark Sample Collected</Text>
          </TouchableOpacity>
        )}
        {status === 'sample_collected' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate('processing')}
          >
            <Text style={styles.actionButtonText}>Start Processing</Text>
          </TouchableOpacity>
        )}
        {status === 'processing' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleStatusUpdate('completed')}
          >
            <Text style={styles.actionButtonText}>Enter Results</Text>
          </TouchableOpacity>
        )}
      </View>
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
  statusBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priorityBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  urgentBadge: {
    backgroundColor: colors.emergency,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  patientDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  testCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  testCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  instructionsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  actionSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
