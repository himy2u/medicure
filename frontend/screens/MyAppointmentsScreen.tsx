/**
 * MyAppointmentsScreen - View upcoming and past appointments
 * Used by: Patient, Caregiver, Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyAppointments'>;

interface Appointment {
  id: string;
  doctor_name?: string;
  patient_name?: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  type: 'in_person' | 'virtual';
  clinic_name?: string;
}

export default function MyAppointmentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [userRole, setUserRole] = useState<string>('');

  useFocusEffect(
    React.useCallback(() => {
      loadUserAndAppointments();
    }, [])
  );

  const loadUserAndAppointments = async () => {
    const role = await SecureStore.getItemAsync('user_role');
    setUserRole(role || '');
    await loadAppointments();
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/appointments/user/${userId}`, true);

      if (result.success && result.data.appointments) {
        setAppointments(result.data.appointments);
      } else {
        // Mock data for demo
        setAppointments([
          {
            id: '1',
            doctor_name: 'Dr. Maria Garcia',
            patient_name: 'John Doe',
            specialty: 'Cardiology',
            date: '2025-12-10',
            time: '10:00 AM',
            status: 'scheduled',
            type: 'in_person',
            clinic_name: 'Heart Care Clinic'
          },
          {
            id: '2',
            doctor_name: 'Dr. Juan Rodriguez',
            patient_name: 'John Doe',
            specialty: 'General Medicine',
            date: '2025-12-08',
            time: '2:30 PM',
            status: 'scheduled',
            type: 'virtual',
            clinic_name: 'MediCure Virtual'
          },
          {
            id: '3',
            doctor_name: 'Dr. Ana Martinez',
            patient_name: 'John Doe',
            specialty: 'Dermatology',
            date: '2025-11-28',
            time: '11:00 AM',
            status: 'completed',
            type: 'in_person',
            clinic_name: 'Skin Health Center'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    if (activeTab === 'upcoming') {
      return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
    }
    return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return colors.accent;
      case 'in_progress': return '#FFA500';
      case 'completed': return '#4CAF50';
      case 'cancelled': return colors.emergency;
      default: return colors.textSecondary;
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.doctorName}>
            {userRole === 'doctor' ? item.patient_name : item.doctor_name}
          </Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>⏰</Text>
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{item.type === 'virtual' ? '💻' : '🏥'}</Text>
          <Text style={styles.detailText}>
            {item.type === 'virtual' ? 'Video Call' : item.clinic_name}
          </Text>
        </View>
      </View>

      {item.status === 'scheduled' && (
        <View style={styles.actionButtons}>
          {item.type === 'virtual' && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => navigation.navigate('VideoCall', {
                appointmentId: item.id,
                otherUserName: userRole === 'doctor' ? item.patient_name || '' : item.doctor_name || '',
                roomId: `medicure-${item.id}`
              })}
            >
              <Text style={styles.joinButtonText}>Join Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', {
              appointmentId: item.id,
              otherUserName: userRole === 'doctor' ? item.patient_name || '' : item.doctor_name || '',
              otherUserId: 'user-id'
            })}
          >
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <RoleGuard 
      allowedRoles={['patient', 'caregiver', 'doctor']}
      fallbackMessage="Only patients, caregivers, and doctors can view appointments."
    >
    <BaseScreen 
      pattern="headerWithScroll" 
      header={<StandardHeader title="My Appointments" />}
    >
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          testID="appointments-list"
          data={filteredAppointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>
                No {activeTab} appointments
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => navigation.navigate('FindDoctor')}
                >
                  <Text style={styles.bookButtonText}>Book an Appointment</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </BaseScreen>
    </RoleGuard>
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
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  specialty: {
    fontSize: 14,
    color: colors.textSecondary,
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
  appointmentDetails: {
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
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chatButtonText: {
    color: colors.accent,
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
    marginBottom: spacing.lg,
  },
  bookButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
