/**
 * PrescriptionDetailsScreen - View and process prescription
 * Used by: Pharmacy Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PrescriptionDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'PrescriptionDetails'>;

export default function PrescriptionDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { prescriptionId } = route.params;

  const [status, setStatus] = useState<'pending' | 'processing' | 'ready' | 'dispensed'>('pending');

  // Mock prescription data
  const prescription = {
    id: prescriptionId,
    patient_name: 'John Doe',
    patient_dob: '1980-05-15',
    patient_phone: '+593987654321',
    prescribing_doctor: 'Dr. Maria Garcia',
    prescription_date: '2025-12-05',
    medications: [
      {
        name: 'Lisinopril',
        strength: '10mg',
        quantity: 30,
        instructions: 'Take 1 tablet by mouth once daily',
        refills: 3
      },
      {
        name: 'Metformin',
        strength: '500mg',
        quantity: 60,
        instructions: 'Take 1 tablet by mouth twice daily with meals',
        refills: 5
      }
    ],
    insurance: {
      provider: 'IESS',
      policy_number: 'POL-123456',
      copay: '$5.00'
    },
    allergies: ['Penicillin', 'Sulfa drugs']
  };

  const handleStartProcessing = () => {
    setStatus('processing');
    Alert.alert('Processing Started', 'Prescription is being prepared.');
  };

  const handleMarkReady = () => {
    setStatus('ready');
    Alert.alert('Ready for Pickup', 'Patient will be notified.');
  };

  const handleDispense = () => {
    navigation.navigate('Fulfillment', { prescriptionId });
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return '#FFA500';
      case 'processing': return '#2196F3';
      case 'ready': return '#4CAF50';
      case 'dispensed': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Prescription</Text>
      </View>
    }>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(status) }]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>

      {/* Allergy Alert */}
      {prescription.allergies.length > 0 && (
        <View style={styles.allergyAlert}>
          <Text style={styles.allergyTitle}>⚠️ Patient Allergies</Text>
          <Text style={styles.allergyText}>{prescription.allergies.join(', ')}</Text>
        </View>
      )}

      {/* Prescription Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescription Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rx #:</Text>
            <Text style={styles.infoValue}>{prescription.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{prescription.prescription_date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Doctor:</Text>
            <Text style={styles.infoValue}>{prescription.prescribing_doctor}</Text>
          </View>
        </View>
      </View>

      {/* Patient Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient</Text>
        <View style={styles.infoCard}>
          <Text style={styles.patientName}>{prescription.patient_name}</Text>
          <Text style={styles.patientDetail}>DOB: {prescription.patient_dob}</Text>
          <Text style={styles.patientDetail}>Phone: {prescription.patient_phone}</Text>
        </View>
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        {prescription.medications.map((med, index) => (
          <View key={index} style={styles.medicationCard}>
            <View style={styles.medHeader}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medStrength}>{med.strength}</Text>
            </View>
            <Text style={styles.medQuantity}>Qty: {med.quantity}</Text>
            <Text style={styles.medInstructions}>{med.instructions}</Text>
            <Text style={styles.medRefills}>Refills: {med.refills}</Text>
          </View>
        ))}
      </View>

      {/* Insurance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insurance</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Provider:</Text>
            <Text style={styles.infoValue}>{prescription.insurance.provider}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Policy:</Text>
            <Text style={styles.infoValue}>{prescription.insurance.policy_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Copay:</Text>
            <Text style={[styles.infoValue, { color: colors.accent }]}>{prescription.insurance.copay}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {status === 'pending' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleStartProcessing}>
            <Text style={styles.actionButtonText}>Start Processing</Text>
          </TouchableOpacity>
        )}
        {status === 'processing' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleMarkReady}
          >
            <Text style={styles.actionButtonText}>Mark Ready for Pickup</Text>
          </TouchableOpacity>
        )}
        {status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleDispense}
          >
            <Text style={styles.actionButtonText}>Dispense Medication</Text>
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
    marginBottom: spacing.md,
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
  allergyAlert: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.emergency,
  },
  allergyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emergency,
    marginBottom: spacing.xs,
  },
  allergyText: {
    fontSize: 14,
    color: colors.textPrimary,
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
  medicationCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medStrength: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  medQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  medInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  medRefills: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  actionSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: '#2196F3',
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
