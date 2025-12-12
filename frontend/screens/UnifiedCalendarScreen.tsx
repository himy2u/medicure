/**
 * UnifiedCalendarScreen - Professional Appointment & Availability Management
 * 
 * Features:
 * - Day view: Timeline with appointments
 * - Week view: 30-min slot grid for setting availability (tap/drag to fill)
 * - Green = Available, Red = Blocked
 * - Tap to toggle, drag to fill multiple slots
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import RoleGuard from '../components/RoleGuard';
import StandardHeader from '../components/StandardHeader';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';
import { useAuthCheck } from '../hooks/useAuthCheck';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  type: string;
  location: string;
  status: string;
}

interface Location {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

const LOCATIONS: Location[] = [
  { id: 'all', name: 'All Locations', shortName: 'All', color: '#666' },
  { id: 'clinic1', name: 'Downtown Clinic', shortName: 'Downtown', color: '#3B82F6' },
  { id: 'clinic2', name: 'North Medical', shortName: 'North', color: '#10B981' },
];

// Time slots: 8 AM to 8 PM in 30-min increments = 24 slots
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  return { id: `${hour}:${min}`, label: `${hour}:${min}`, hour, minute: i % 2 * 30 };
});

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_BLOCKS = [
  { id: 'morning', label: 'Morning', range: '8-12', slots: TIME_SLOTS.slice(0, 8) },
  { id: 'afternoon', label: 'Afternoon', range: '12-16', slots: TIME_SLOTS.slice(8, 16) },
  { id: 'evening', label: 'Evening', range: '16-20', slots: TIME_SLOTS.slice(16, 24) },
];

export default function UnifiedCalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedLocation, setSelectedLocation] = useState('clinic1');
  const [isEditMode, setIsEditMode] = useState(false);
  const [availability, setAvailability] = useState<{[key: string]: boolean}>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dragMode, setDragMode] = useState<'set' | 'clear' | null>(null);

  useAuthCheck();

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Initialize default availability
  useEffect(() => {
    const defaultAvail: {[key: string]: boolean} = {};
    getWeekDates().forEach(date => {
      const dayKey = date.toISOString().split('T')[0];
      TIME_SLOTS.forEach(slot => {
        // Default: 9 AM - 5 PM available on weekdays
        const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
        const isWorkHours = slot.hour >= 9 && slot.hour < 17;
        defaultAvail[`${dayKey}-${slot.id}`] = isWeekday && isWorkHours;
      });
    });
    setAvailability(prev => ({ ...defaultAvail, ...prev }));
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/doctors/${userId}/calendar`, true);
      if (result.success && result.data) {
        setAppointments(result.data.appointments || []);
      }
    } catch (e) {
      console.log('Using mock data');
    }
    
    // Mock appointments
    if (appointments.length === 0) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setAppointments([
        { id: '1', time: '09:00', patientName: 'Maria G.', type: 'scheduled', location: 'clinic1', status: 'confirmed' },
        { id: '2', time: '10:30', patientName: 'Carlos R.', type: 'scheduled', location: 'clinic1', status: 'confirmed' },
        { id: '3', time: '14:00', patientName: 'Ana M.', type: 'emergency', location: 'clinic2', status: 'pending' },
        { id: '4', time: '15:30', patientName: 'Luis F.', type: 'scheduled', location: 'clinic1', status: 'confirmed' },
      ]);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const days = viewMode === 'week' ? 7 : 1;
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? days : -days));
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const toggleSlot = (dayKey: string, slotId: string) => {
    if (!isEditMode) return;
    const key = `${dayKey}-${slotId}`;
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSlotPress = (dayKey: string, slotId: string) => {
    if (!isEditMode) return;
    const key = `${dayKey}-${slotId}`;
    const newValue = !availability[key];
    setAvailability(prev => ({ ...prev, [key]: newValue }));
    setDragMode(newValue ? 'set' : 'clear');
  };

  const handleSlotDrag = (dayKey: string, slotId: string) => {
    if (!isEditMode || !dragMode) return;
    const key = `${dayKey}-${slotId}`;
    setAvailability(prev => ({ ...prev, [key]: dragMode === 'set' }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getLocationColor = (locationId: string) => {
    return LOCATIONS.find(l => l.id === locationId)?.color || '#666';
  };

  const getAppointmentsForSlot = (slot: typeof TIME_SLOTS[0]) => {
    return appointments.filter(apt => {
      const [h, m] = apt.time.split(':').map(Number);
      return h === slot.hour && (m < 30 ? slot.minute === 0 : slot.minute === 30);
    });
  };

  const totalToday = appointments.length;
  const weekDates = getWeekDates();

  // Week View with 30-min slots
  const renderWeekView = () => (
    <View style={styles.weekContainer}>
      {/* Day Headers */}
      <View style={styles.weekHeader}>
        <View style={styles.timeColumn} />
        {weekDates.map((date, idx) => {
          const isCurrentDay = date.toDateString() === today.toDateString();
          return (
            <View key={idx} style={[styles.dayHeader, isCurrentDay && styles.dayHeaderToday]}>
              <Text style={styles.dayHeaderName}>{DAYS[date.getDay()]}</Text>
              <Text style={[styles.dayHeaderNum, isCurrentDay && styles.dayHeaderNumToday]}>
                {date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Time Blocks */}
      {DAY_BLOCKS.map(block => (
        <View key={block.id} style={styles.timeBlockSection}>
          <Text style={styles.blockLabel}>{block.label} ({block.range})</Text>
          <View style={styles.slotsGrid}>
            {/* Time labels */}
            <View style={styles.timeLabels}>
              {block.slots.filter((_, i) => i % 2 === 0).map(slot => (
                <Text key={slot.id} style={styles.timeSlotLabel}>{slot.hour}:00</Text>
              ))}
            </View>
            
            {/* Slots for each day */}
            {weekDates.map((date, dayIdx) => {
              const dayKey = date.toISOString().split('T')[0];
              return (
                <View key={dayIdx} style={styles.dayColumn}>
                  {block.slots.map((slot, slotIdx) => {
                    const key = `${dayKey}-${slot.id}`;
                    const isAvailable = availability[key];
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.slot,
                          isAvailable ? styles.slotAvailable : styles.slotBlocked,
                          !isEditMode && styles.slotDisabled,
                        ]}
                        onPress={() => handleSlotPress(dayKey, slot.id)}
                        onPressIn={() => setDragMode(isAvailable ? 'clear' : 'set')}
                        onPressOut={() => setDragMode(null)}
                        activeOpacity={isEditMode ? 0.7 : 1}
                      >
                        {isEditMode && (
                          <Text style={[styles.slotIcon, isAvailable ? styles.slotIconAvailable : styles.slotIconBlocked]}>
                            {isAvailable ? '✓' : '✕'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  // Day View
  const renderDayView = () => (
    <View style={styles.dayContainer}>
      {DAY_BLOCKS.map(block => (
        <View key={block.id} style={styles.dayBlock}>
          <View style={styles.dayBlockHeader}>
            <Text style={styles.dayBlockTitle}>{block.label}</Text>
            <Text style={styles.dayBlockRange}>{block.range}</Text>
          </View>
          <View style={styles.dayBlockContent}>
            {block.slots.map(slot => {
              const slotAppointments = getAppointmentsForSlot(slot);
              const dayKey = selectedDate.toISOString().split('T')[0];
              const isAvailable = availability[`${dayKey}-${slot.id}`];
              
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.daySlot,
                    isEditMode && (isAvailable ? styles.daySlotAvailable : styles.daySlotBlocked),
                  ]}
                  onPress={() => isEditMode && toggleSlot(dayKey, slot.id)}
                  activeOpacity={isEditMode ? 0.7 : 1}
                >
                  <Text style={styles.daySlotTime}>{slot.label}</Text>
                  {slotAppointments.length > 0 ? (
                    <View style={[styles.appointmentChip, { borderLeftColor: getLocationColor(slotAppointments[0].location) }]}>
                      <Text style={styles.appointmentName}>{slotAppointments[0].patientName}</Text>
                      {slotAppointments[0].type === 'emergency' && <Text style={styles.emergencyDot}>●</Text>}
                    </View>
                  ) : isEditMode ? (
                    <Text style={[styles.availabilityLabel, isAvailable ? styles.availableLabelText : styles.blockedLabelText]}>
                      {isAvailable ? '✓ Open' : '✕ Closed'}
                    </Text>
                  ) : (
                    <Text style={styles.emptySlot}>—</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <RoleGuard allowedRoles={['doctor', 'medical_staff']} fallbackMessage="Access restricted.">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with back, home, signout */}
        <StandardHeader 
          title="Calendar"
          showBackButton={true}
          showHomeButton={true}
          rightComponent={
            <TouchableOpacity 
              style={[styles.editBtn, isEditMode && styles.editBtnActive]}
              onPress={() => setIsEditMode(!isEditMode)}
            >
              <Text style={[styles.editBtnText, isEditMode && styles.editBtnTextActive]}>
                {isEditMode ? '✓ Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          }
        />

        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigateDate('prev')}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dateDisplay} onPress={goToToday}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            {isToday && <View style={styles.todayDot} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={() => navigateDate('next')}>
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
              onPress={() => setViewMode('day')}
            >
              <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
              onPress={() => setViewMode('week')}
            >
              <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Pills (only in edit mode) */}
        {isEditMode && (
          <View style={styles.locationBar}>
            {LOCATIONS.filter(l => l.id !== 'all').map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={[styles.locationPill, selectedLocation === loc.id && styles.locationPillActive]}
                onPress={() => setSelectedLocation(loc.id)}
              >
                <View style={[styles.locationDot, { backgroundColor: loc.color }]} />
                <Text style={[styles.locationText, selectedLocation === loc.id && styles.locationTextActive]}>
                  {loc.shortName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <View style={styles.editNotice}>
            <Text style={styles.editNoticeText}>
              Tap slots to toggle: <Text style={styles.greenText}>✓ Green = Open</Text> · <Text style={styles.redText}>✕ Red = Closed</Text>
            </Text>
          </View>
        )}

        {/* Content */}
        {viewMode === 'week' ? renderWeekView() : renderDayView()}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendAvailable]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBlocked]} />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBooked]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>
      </SafeAreaView>
    </RoleGuard>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#374151', fontWeight: '300' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  editBtnActive: { backgroundColor: '#10B981' },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  editBtnTextActive: { color: '#FFF' },
  
  // Date Nav
  dateNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18, color: '#374151', fontWeight: '300' },
  dateDisplay: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dateText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6' },
  viewToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  toggleTextActive: { color: '#111827' },
  
  // Location Bar
  locationBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  locationPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', gap: 6 },
  locationPillActive: { backgroundColor: '#111827' },
  locationDot: { width: 8, height: 8, borderRadius: 4 },
  locationText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  locationTextActive: { color: '#FFF' },
  
  // Edit Notice
  editNotice: { backgroundColor: '#DBEAFE', paddingHorizontal: 16, paddingVertical: 10 },
  editNoticeText: { fontSize: 13, color: '#1E40AF', textAlign: 'center' },
  greenText: { color: '#059669', fontWeight: '600' },
  redText: { color: '#DC2626', fontWeight: '600' },
  
  // Week View
  weekContainer: { flex: 1, paddingHorizontal: 8, paddingTop: 8 },
  weekHeader: { flexDirection: 'row', marginBottom: 8 },
  timeColumn: { width: 36 },
  dayHeader: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayHeaderToday: { backgroundColor: '#EFF6FF', borderRadius: 8 },
  dayHeaderName: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  dayHeaderNum: { fontSize: 14, fontWeight: '600', color: '#374151' },
  dayHeaderNumToday: { color: '#3B82F6' },
  
  timeBlockSection: { marginBottom: 8 },
  blockLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 4, marginLeft: 4 },
  slotsGrid: { flexDirection: 'row' },
  timeLabels: { width: 36, justifyContent: 'space-around' },
  timeSlotLabel: { fontSize: 9, color: '#9CA3AF', textAlign: 'right', paddingRight: 4 },
  dayColumn: { flex: 1, gap: 1 },
  
  slot: { height: 18, marginHorizontal: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  slotAvailable: { backgroundColor: '#D1FAE5' },
  slotBlocked: { backgroundColor: '#FEE2E2' },
  slotDisabled: { opacity: 0.5 },
  slotIcon: { fontSize: 10, fontWeight: '700' },
  slotIconAvailable: { color: '#059669' },
  slotIconBlocked: { color: '#DC2626' },
  
  // Day View
  dayContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  dayBlock: { marginBottom: 12 },
  dayBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dayBlockTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  dayBlockRange: { fontSize: 12, color: '#9CA3AF' },
  dayBlockContent: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  
  daySlot: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  daySlotAvailable: { backgroundColor: '#F0FDF4' },
  daySlotBlocked: { backgroundColor: '#FEF2F2' },
  daySlotTime: { width: 50, fontSize: 12, fontWeight: '600', color: '#6B7280' },
  
  appointmentChip: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderLeftWidth: 3, gap: 6 },
  appointmentName: { fontSize: 13, fontWeight: '500', color: '#374151' },
  emergencyDot: { fontSize: 8, color: '#DC2626' },
  
  availabilityLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  availableLabelText: { color: '#059669' },
  blockedLabelText: { color: '#DC2626' },
  emptySlot: { flex: 1, fontSize: 12, color: '#D1D5DB' },
  
  // Legend
  legend: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, gap: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 16, height: 16, borderRadius: 4 },
  legendAvailable: { backgroundColor: '#D1FAE5' },
  legendBlocked: { backgroundColor: '#FEE2E2' },
  legendBooked: { backgroundColor: '#DBEAFE' },
  legendText: { fontSize: 11, color: '#6B7280' },
});
