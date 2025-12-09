/**
 * DispatchDetailsScreen - View and manage emergency dispatch
 * Used by: Ambulance Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DispatchDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'DispatchDetails'>;

export default function DispatchDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { dispatchId } = route.params;

  const [status, setStatus] = useState<'assigned' | 'en_route' | 'on_scene' | 'transporting' | 'completed'>('assigned');

  // Mock dispatch data
  const dispatch = {
    id: dispatchId,
    patient_name: 'John Doe',
    patient_phone: '+593987654321',
    patient_address: 'Av. 6 de Diciembre N32-45, Quito',
    symptoms: 'Chest pain, difficulty breathing',
    priority: 'HIGH',
    destination: 'Hospital Metropolitano',
    destination_address: 'Av. Mariana de Jesus, Quito',
    requesting_doctor: 'Dr. Maria Garcia',
    assigned_time: '10:15 AM',
    notes: 'Patient has history of heart disease'
  };

  const updateStatus = (newStatus: typeof status) => {
    setStatus(newStatus);
    Alert.alert('Status Updated', `Status changed to: ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const openNavigation = () => {
    const address = status === 'on_scene' ? dispatch.destination_address : dispatch.patient_address;
    const url = `maps://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?daddr=${encodeURIComponent(address)}`);
    });
  };

  const callPatient = () => {
    Linking.openURL(`tel:${dispatch.patient_phone}`);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'assigned': return colors.textSecondary;
      case 'en_route': return '#FFA500';
      case 'on_scene': return '#2196F3';
      case 'transporting': return colors.emergency;
      case 'completed': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={[styles.header, { backgroundColor: colors.emergency }]}>
        <BackButton color="#FFFFFF" />
        <Text style={styles.headerTitle}>Emergency Dispatch</Text>
      </View>
    }>
      {/* Priority Banner */}
      <View style={styles.priorityBanner}>
        <Text style={styles.priorityText}>🚨 {dispatch.priority} PRIORITY</Text>
      </View>

      {/* Status Tracker */}
      <View style={styles.statusTracker}>
        {['assigned', 'en_route', 'on_scene', 'transporting', 'completed'].map((s, index) => (
          <View key={s} style={styles.statusStep}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(s) },
              status === s && styles.activeDot
            ]} />
            <Text style={[styles.statusLabel, status === s && styles.activeLabel]}>
              {s.replace('_', ' ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Patient Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.patientName}>{dispatch.patient_name}</Text>
          <TouchableOpacity style={styles.phoneRow} onPress={callPatient}>
            <Text style={styles.phoneIcon}>📞</Text>
            <Text style={styles.phoneNumber}>{dispatch.patient_phone}</Text>
          </TouchableOpacity>
          <Text style={styles.symptomsTitle}>Symptoms:</Text>
          <Text style={styles.symptomsText}>{dispatch.symptoms}</Text>
          {dispatch.notes && (
            <>
              <Text style={styles.notesTitle}>Notes:</Text>
              <Text style={styles.notesText}>{dispatch.notes}</Text>
            </>
          )}
        </View>
      </View>

      {/* Pickup Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{dispatch.patient_address}</Text>
        </View>
      </View>

      {/* Destination */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Destination</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>🏥</Text>
          <View style={styles.destinationInfo}>
            <Text style={styles.hospitalName}>{dispatch.destination}</Text>
            <Text style={styles.locationText}>{dispatch.destination_address}</Text>
          </View>
        </View>
      </View>

      {/* Navigation Button */}
      <TouchableOpacity style={styles.navButton} onPress={openNavigation}>
        <Text style={styles.navButtonText}>🗺️ Open Navigation</Text>
      </TouchableOpacity>

      {/* Status Update Buttons */}
      <View style={styles.statusButtons}>
        {status === 'assigned' && (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => updateStatus('en_route')}
          >
            <Text style={styles.statusButtonText}>Start - En Route to Patient</Text>
          </TouchableOpacity>
        )}
        {status === 'en_route' && (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => updateStatus('on_scene')}
          >
            <Text style={styles.statusButtonText}>Arrived at Scene</Text>
          </TouchableOpacity>
        )}
        {status === 'on_scene' && (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: colors.emergency }]}
            onPress={() => updateStatus('transporting')}
          >
            <Text style={styles.statusButtonText}>Begin Transport to Hospital</Text>
          </TouchableOpacity>
        )}
        {status === 'transporting' && (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              updateStatus('completed');
              setTimeout(() => {
                navigation.navigate('IncidentReport', { dispatchId });
              }, 500);
            }}
          >
            <Text style={styles.statusButtonText}>Arrived - Complete Transport</Text>
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
    color: '#FFFFFF',
    marginLeft: spacing.md,
  },
  priorityBanner: {
    backgroundColor: colors.emergency,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  activeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  statusLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: '700',
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
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  symptomsText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  locationCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  locationText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  destinationInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  navButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusButtons: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusButton: {
    backgroundColor: '#2196F3',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
