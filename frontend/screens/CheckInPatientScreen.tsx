/**
 * CheckInPatientScreen - Check in arriving patients
 * Used by: Medical Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CheckInPatient'>;

export default function CheckInPatientScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });
  const [reasonForVisit, setReasonForVisit] = useState('');

  const mockPatients = [
    { id: '1', name: 'John Doe', dob: '1980-05-15', phone: '+593987654321', appointment: '10:00 AM - Dr. Garcia' },
    { id: '2', name: 'Maria Santos', dob: '1992-08-22', phone: '+593987654322', appointment: '10:30 AM - Dr. Rodriguez' },
  ];

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const handleCheckIn = () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient');
      return;
    }

    Alert.alert(
      'Check-In Complete',
      `${selectedPatient.name} has been checked in and added to the queue.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Check In Patient</Text>
      </View>
    }>
      {/* Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Find Patient</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            {filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.patientResult,
                  selectedPatient?.id === patient.id && styles.selectedPatient
                ]}
                onPress={() => setSelectedPatient(patient)}
              >
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientDetails}>DOB: {patient.dob}</Text>
                <Text style={styles.patientDetails}>{patient.appointment}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedPatient && (
        <>
          {/* Selected Patient Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Patient</Text>
            <View style={styles.selectedPatientCard}>
              <Text style={styles.selectedName}>{selectedPatient.name}</Text>
              <Text style={styles.selectedDetail}>Phone: {selectedPatient.phone}</Text>
              <Text style={styles.selectedDetail}>Appointment: {selectedPatient.appointment}</Text>
            </View>
          </View>

          {/* Vitals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Record Vitals</Text>

            <View style={styles.vitalsGrid}>
              <View style={styles.vitalInput}>
                <Text style={styles.vitalLabel}>Blood Pressure</Text>
                <TextInput
                  style={styles.vitalField}
                  placeholder="120/80"
                  placeholderTextColor={colors.textSecondary}
                  value={vitals.bloodPressure}
                  onChangeText={(text) => setVitals({...vitals, bloodPressure: text})}
                />
              </View>

              <View style={styles.vitalInput}>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
                <TextInput
                  style={styles.vitalField}
                  placeholder="72 bpm"
                  placeholderTextColor={colors.textSecondary}
                  value={vitals.heartRate}
                  onChangeText={(text) => setVitals({...vitals, heartRate: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.vitalInput}>
                <Text style={styles.vitalLabel}>Temperature</Text>
                <TextInput
                  style={styles.vitalField}
                  placeholder="98.6 °F"
                  placeholderTextColor={colors.textSecondary}
                  value={vitals.temperature}
                  onChangeText={(text) => setVitals({...vitals, temperature: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.vitalInput}>
                <Text style={styles.vitalLabel}>Weight</Text>
                <TextInput
                  style={styles.vitalField}
                  placeholder="70 kg"
                  placeholderTextColor={colors.textSecondary}
                  value={vitals.weight}
                  onChangeText={(text) => setVitals({...vitals, weight: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.vitalInput}>
                <Text style={styles.vitalLabel}>O2 Saturation</Text>
                <TextInput
                  style={styles.vitalField}
                  placeholder="98%"
                  placeholderTextColor={colors.textSecondary}
                  value={vitals.oxygenSaturation}
                  onChangeText={(text) => setVitals({...vitals, oxygenSaturation: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Reason for Visit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Visit</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for visit..."
              placeholderTextColor={colors.textSecondary}
              value={reasonForVisit}
              onChangeText={setReasonForVisit}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Check In Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
              <Text style={styles.checkInButtonText}>Complete Check-In</Text>
            </TouchableOpacity>
          </View>
        </>
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
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchResults: {
    marginTop: spacing.md,
  },
  patientResult: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  selectedPatient: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  patientDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedPatientCard: {
    backgroundColor: colors.accent + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  selectedDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  vitalInput: {
    width: '47%',
  },
  vitalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  vitalField: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
  },
  reasonInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  checkInButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
