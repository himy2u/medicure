/**
 * AppointmentDetailsScreen - View details of a single appointment
 * Used by: Patient, Caregiver, Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AppointmentDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'AppointmentDetails'>;

interface AppointmentDetail {
  id: string;
  doctor_name: string;
  doctor_specialty: string;
  patient_name: string;
  date: string;
  time: string;
  status: string;
  type: 'in_person' | 'virtual';
  clinic_name: string;
  clinic_address: string;
  reason: string;
  notes: string;
  prescriptions: any[];
  lab_orders: any[];
}

export default function AppointmentDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadAppointmentDetails();
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    const role = await SecureStore.getItemAsync('user_role');
    setUserRole(role || '');

    try {
      const result = await apiClient.get(`/api/appointments/${appointmentId}`, true);

      if (result.success && result.data) {
        setAppointment(result.data);
      } else {
        // Mock data for demo
        setAppointment({
          id: appointmentId,
          doctor_name: 'Dr. Maria Garcia',
          doctor_specialty: 'Cardiology',
          patient_name: 'John Doe',
          date: '2025-12-10',
          time: '10:00 AM',
          status: 'scheduled',
          type: 'in_person',
          clinic_name: 'Heart Care Clinic',
          clinic_address: 'Av. 6 de Diciembre N32-45, Quito',
          reason: 'Annual checkup',
          notes: 'Please bring previous ECG results if available.',
          prescriptions: [],
          lab_orders: []
        });
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/appointments/${appointmentId}/cancel`, {}, true);
              Alert.alert('Success', 'Appointment cancelled successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const handleStartConsultation = () => {
    if (appointment?.type === 'virtual') {
      navigation.navigate('VideoCall', {
        appointmentId: appointment.id,
        otherUserName: userRole === 'doctor' ? appointment.patient_name : appointment.doctor_name,
        roomId: `medicure-${appointment.id}`
      });
    } else {
      // Mark as in progress for in-person
      Alert.alert('Starting Consultation', 'Patient consultation started');
    }
  };

  if (loading) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading appointment...</Text>
        </View>
      </BaseScreen>
    );
  }

  if (!appointment) {
    return (
      <BaseScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appointment not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Appointment Details</Text>
      </View>
    }>
      {/* Status Badge */}
      <View style={[styles.statusBanner, { backgroundColor: colors.accent }]}>
        <Text style={styles.statusBannerText}>{appointment.status.toUpperCase()}</Text>
      </View>

      {/* Doctor/Patient Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {userRole === 'doctor' ? 'Patient Information' : 'Doctor Information'}
        </Text>
        <View style={styles.infoCard}>
          <Text style={styles.personName}>
            {userRole === 'doctor' ? appointment.patient_name : appointment.doctor_name}
          </Text>
          {userRole !== 'doctor' && (
            <Text style={styles.specialty}>{appointment.doctor_specialty}</Text>
          )}
        </View>
      </View>

      {/* Appointment Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{appointment.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{appointment.type === 'virtual' ? '💻' : '🏥'}</Text>
            <Text style={styles.infoText}>
              {appointment.type === 'virtual' ? 'Video Consultation' : appointment.clinic_name}
            </Text>
          </View>
          {appointment.type !== 'virtual' && (
            <Text style={styles.addressText}>{appointment.clinic_address}</Text>
          )}
        </View>
      </View>

      {/* Reason for Visit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reason for Visit</Text>
        <View style={styles.infoCard}>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </View>
      </View>

      {/* Notes */}
      {appointment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.infoCard}>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {appointment.status === 'scheduled' && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartConsultation}
            >
              <Text style={styles.primaryButtonText}>
                {appointment.type === 'virtual' ? 'Join Video Call' : 'Start Consultation'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', {
                appointmentId: appointment.id,
                otherUserName: userRole === 'doctor' ? appointment.patient_name : appointment.doctor_name,
                otherUserId: 'other-user-id'
              })}
            >
              <Text style={styles.chatButtonText}>Message</Text>
            </TouchableOpacity>

            {userRole !== 'doctor' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelAppointment}
              >
                <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
              </TouchableOpacity>
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusBannerText: {
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
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  personName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  specialty: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  infoText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 36,
  },
  reasonText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  chatButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  chatButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.emergency,
  },
  cancelButtonText: {
    color: colors.emergency,
    fontSize: 16,
    fontWeight: '600',
  },
});
