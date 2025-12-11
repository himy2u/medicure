/**
 * DoctorScheduleScreen - Calendar view with appointments and schedule setup
 * Used by: Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Appointment {
  id: string;
  patient_name: string;
  time: string;
  type: 'emergency' | 'scheduled';
  status: string;
}

export default function DoctorScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  // Navigate to previous/next day or week
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      // Mock appointments for demo - enough to require scrolling
      const mockAppointments: Appointment[] = [
        { id: '1', patient_name: 'John Smith', time: '08:00', type: 'scheduled', status: 'confirmed' },
        { id: '2', patient_name: 'Maria Garcia', time: '08:30', type: 'scheduled', status: 'confirmed' },
        { id: '3', patient_name: 'Carlos Rodriguez', time: '09:00', type: 'scheduled', status: 'confirmed' },
        { id: '4', patient_name: 'Ana Martinez', time: '09:30', type: 'scheduled', status: 'pending' },
        { id: '5', patient_name: 'Emergency Patient', time: '10:00', type: 'emergency', status: 'pending' },
        { id: '6', patient_name: 'Luis Fernandez', time: '10:30', type: 'scheduled', status: 'confirmed' },
        { id: '7', patient_name: 'Sofia Ramirez', time: '11:00', type: 'scheduled', status: 'confirmed' },
        { id: '8', patient_name: 'Pedro Sanchez', time: '11:30', type: 'scheduled', status: 'pending' },
        { id: '9', patient_name: 'Isabella Torres', time: '14:00', type: 'scheduled', status: 'confirmed' },
        { id: '10', patient_name: 'Miguel Herrera', time: '14:30', type: 'scheduled', status: 'confirmed' },
        { id: '11', patient_name: 'Carmen Diaz', time: '15:00', type: 'scheduled', status: 'pending' },
        { id: '12', patient_name: 'Roberto Flores', time: '15:30', type: 'scheduled', status: 'confirmed' },
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSetupSchedule = () => {
    Alert.alert(
      'Setup Schedule',
      'Choose how to setup your schedule:',
      [
        {
          text: 'Today Only',
          onPress: () => setupScheduleForDay(selectedDate)
        },
        {
          text: 'This Week',
          onPress: () => setupScheduleForWeek()
        },
        {
          text: 'Advanced Settings',
          onPress: () => navigation.navigate('DoctorAvailability' as any)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const setupScheduleForDay = (date: Date) => {
    Alert.alert(
      'Setup Schedule for ' + date.toLocaleDateString(),
      'Set your availability for this day:',
      [
        {
          text: 'Available 9 AM - 5 PM',
          onPress: () => Alert.alert('Success', 'Schedule set for 9 AM - 5 PM')
        },
        {
          text: 'Available 8 AM - 6 PM',
          onPress: () => Alert.alert('Success', 'Schedule set for 8 AM - 6 PM')
        },
        {
          text: 'Custom Hours',
          onPress: () => Alert.alert('Custom Hours', 'Feature coming soon')
        },
        {
          text: 'Not Available',
          onPress: () => Alert.alert('Success', 'Marked as not available')
        }
      ]
    );
  };

  const setupScheduleForWeek = () => {
    Alert.alert(
      'Setup Weekly Schedule',
      'Set your availability for this week:',
      [
        {
          text: 'Standard Hours (9-5)',
          onPress: () => Alert.alert('Success', 'Weekly schedule set to 9 AM - 5 PM')
        },
        {
          text: 'Extended Hours (8-6)',
          onPress: () => Alert.alert('Success', 'Weekly schedule set to 8 AM - 6 PM')
        },
        {
          text: 'Custom Schedule',
          onPress: () => navigation.navigate('DoctorAvailability' as any)
        }
      ]
    );
  };

  const handleCancelAppointment = (apt: Appointment) => {
    if (apt.type === 'emergency') {
      Alert.alert('Cannot Cancel', 'Emergency appointments cannot be cancelled.');
      return;
    }
    
    Alert.alert(
      'Cancel Appointment',
      `Cancel appointment with ${apt.patient_name} at ${apt.time}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            setAppointments(prev => prev.filter(a => a.id !== apt.id));
            Alert.alert('Cancelled', 'Appointment has been cancelled.');
          }
        }
      ]
    );
  };

  const renderAppointment = ({ item: apt }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTime}>
        <Text style={styles.timeText}>{apt.time}</Text>
      </View>
      <View style={styles.appointmentInfo}>
        <Text style={styles.patientName}>{apt.patient_name}</Text>
        <Text style={[
          styles.appointmentType,
          apt.type === 'emergency' && styles.emergencyType
        ]}>
          {apt.type === 'emergency' ? '🚨 ER' : '📅'}
        </Text>
      </View>
      <View style={styles.appointmentActions}>
        <View style={[
          styles.statusBadge,
          apt.status === 'confirmed' && styles.confirmedBadge,
          apt.status === 'pending' && styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>{apt.status}</Text>
        </View>
        {apt.type !== 'emergency' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(apt)}
          >
            <Text style={styles.cancelButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDayView = () => (
    <View style={styles.dayView}>
      <Text style={styles.dayTitle}>
        {selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })}
      </Text>
      
      <FlatList
        testID="appointments-list"
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        style={styles.appointmentsList}
        contentContainerStyle={styles.appointmentsContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        initialNumToRender={5}
        windowSize={10}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAppointments} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No appointments today</Text>
            <TouchableOpacity style={styles.setupButton} onPress={handleSetupSchedule}>
              <Text style={styles.setupButtonText}>Setup Schedule</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );

  const renderWeekView = () => (
    <View style={styles.weekView}>
      <View style={styles.weekHeader}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.weekDay,
              date.toDateString() === selectedDate.toDateString() && styles.selectedWeekDay,
              date.toDateString() === today.toDateString() && styles.todayWeekDay
            ]}
            onPress={() => handleDateSelect(date)}
          >
            <Text style={[
              styles.weekDayName,
              date.toDateString() === selectedDate.toDateString() && styles.selectedWeekDayText
            ]}>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <Text style={[
              styles.weekDayNumber,
              date.toDateString() === selectedDate.toDateString() && styles.selectedWeekDayText
            ]}>
              {date.getDate()}
            </Text>
            {/* Show appointment count */}
            <View style={styles.appointmentCount}>
              <Text style={styles.appointmentCountText}>
                {date.toDateString() === selectedDate.toDateString() ? appointments.length : Math.floor(Math.random() * 4)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {renderDayView()}
    </View>
  );

  return (
    <RoleGuard 
      allowedRoles={['doctor']}
      fallbackMessage="Only doctors can view schedules."
    >
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StandardHeader title="Schedule" />
      
      {/* Combined Navigation - Arrows + Toggle in one row */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.navArrow} onPress={() => navigateDate('prev')}>
          <Text style={styles.navArrowText}>◀</Text>
        </TouchableOpacity>
        
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.viewModeText, viewMode === 'day' && styles.activeViewModeText]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>Week</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.navArrow} onPress={() => navigateDate('next')}>
          <Text style={styles.navArrowText}>▶</Text>
        </TouchableOpacity>
      </View>
      
      {/* Today Button */}
      <TouchableOpacity style={styles.todayButtonRow} onPress={goToToday}>
        <Text style={styles.todayButtonText}>↻ Today</Text>
      </TouchableOpacity>
      
      {viewMode === 'day' ? renderDayView() : renderWeekView()}
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.setupButtonFooter}
          onPress={handleSetupSchedule}
        >
          <Text style={styles.setupButtonFooterText}>Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  dayView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentsContent: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  appointmentTime: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emergencyType: {
    color: colors.emergency,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  confirmedBadge: {
    backgroundColor: colors.success,
  },
  pendingBadge: {
    backgroundColor: '#FFA500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  weekView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  selectedWeekDay: {
    backgroundColor: colors.accent,
  },
  todayWeekDay: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  weekDayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  appointmentCount: {
    backgroundColor: colors.emergency,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Combined Navigation Bar
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  navArrow: {
    width: 40,
    height: 40,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  navArrowText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '700',
  },
  todayButtonRow: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  // View Mode Toggle
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: 2,
    flex: 1,
    maxWidth: 160,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeViewMode: {
    backgroundColor: colors.accent,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeViewModeText: {
    color: '#FFFFFF',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  setupButtonFooter: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  setupButtonFooterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  setupButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});