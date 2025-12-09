/**
 * FulfillmentScreen - Complete prescription fulfillment
 * Used by: Pharmacy Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Fulfillment'>;
type RouteProps = RouteProp<RootStackParamList, 'Fulfillment'>;

export default function FulfillmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { prescriptionId } = route.params;

  const [verificationComplete, setVerificationComplete] = useState(false);
  const [counselingProvided, setCounselingProvided] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [patientSignature, setPatientSignature] = useState(false);
  const [counselingNotes, setCounselingNotes] = useState('');

  // Mock data
  const prescription = {
    patient_name: 'John Doe',
    medications: [
      { name: 'Lisinopril 10mg', quantity: 30 },
      { name: 'Metformin 500mg', quantity: 60 }
    ],
    copay: '$5.00',
    total: '$5.00'
  };

  const allChecksComplete = verificationComplete && counselingProvided && paymentReceived && patientSignature;

  const handleDispense = () => {
    if (!allChecksComplete) {
      Alert.alert('Incomplete', 'Please complete all verification steps.');
      return;
    }

    Alert.alert(
      'Prescription Dispensed',
      `Prescription #${prescriptionId} has been dispensed to ${prescription.patient_name}.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PharmacyStaffHome')
        }
      ]
    );
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Fulfillment</Text>
      </View>
    }>
      {/* Patient & Rx Info */}
      <View style={styles.infoSection}>
        <Text style={styles.rxNumber}>Rx #{prescriptionId}</Text>
        <Text style={styles.patientName}>{prescription.patient_name}</Text>
      </View>

      {/* Medications Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        {prescription.medications.map((med, index) => (
          <View key={index} style={styles.medRow}>
            <Text style={styles.medName}>{med.name}</Text>
            <Text style={styles.medQty}>Qty: {med.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Verification Checklist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Checklist</Text>

        <View style={styles.checkItem}>
          <View style={styles.checkInfo}>
            <Text style={styles.checkLabel}>Patient ID Verified</Text>
            <Text style={styles.checkDescription}>Confirm patient identity with valid ID</Text>
          </View>
          <Switch
            value={verificationComplete}
            onValueChange={setVerificationComplete}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.checkItem}>
          <View style={styles.checkInfo}>
            <Text style={styles.checkLabel}>Patient Counseling Provided</Text>
            <Text style={styles.checkDescription}>Explain medication usage and side effects</Text>
          </View>
          <Switch
            value={counselingProvided}
            onValueChange={setCounselingProvided}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.checkItem}>
          <View style={styles.checkInfo}>
            <Text style={styles.checkLabel}>Payment Received</Text>
            <Text style={styles.checkDescription}>Copay: {prescription.copay}</Text>
          </View>
          <Switch
            value={paymentReceived}
            onValueChange={setPaymentReceived}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.checkItem}>
          <View style={styles.checkInfo}>
            <Text style={styles.checkLabel}>Patient Signature</Text>
            <Text style={styles.checkDescription}>Patient has signed for medication</Text>
          </View>
          <Switch
            value={patientSignature}
            onValueChange={setPatientSignature}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Counseling Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Counseling Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Document any counseling provided..."
          placeholderTextColor={colors.textSecondary}
          value={counselingNotes}
          onChangeText={setCounselingNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSection}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Copay:</Text>
          <Text style={styles.paymentValue}>{prescription.copay}</Text>
        </View>
        <View style={styles.paymentDivider} />
        <View style={styles.paymentRow}>
          <Text style={styles.paymentTotalLabel}>Total Due:</Text>
          <Text style={styles.paymentTotalValue}>{prescription.total}</Text>
        </View>
      </View>

      {/* Dispense Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.dispenseButton, !allChecksComplete && styles.dispenseButtonDisabled]}
          onPress={handleDispense}
          disabled={!allChecksComplete}
        >
          <Text style={styles.dispenseButtonText}>
            Complete Dispensing
          </Text>
        </TouchableOpacity>

        {!allChecksComplete && (
          <Text style={styles.incompleteText}>
            Complete all verification steps to dispense
          </Text>
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
  infoSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
  rxNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  medQty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  checkInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  checkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  checkDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  actionSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  dispenseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  dispenseButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  dispenseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  incompleteText: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
