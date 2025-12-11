/**
 * DoctorAvailabilityScreen - Manage doctor's availability schedule
 * Used by: Doctor
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert, ScrollView, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DoctorAvailability'>;

interface TimeSlot {
  hour: number;
  available: boolean;
}

interface DaySchedule {
  day: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

export default function DoctorAvailabilityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [availableNow, setAvailableNow] = useState(true);
  const [acceptsEmergencies, setAcceptsEmergencies] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);

  // Refs for synchronized horizontal scrolling
  const scrollRefs = useRef<(ScrollView | null)[]>([]);
  const headerScrollRef = useRef<ScrollView | null>(null);
  const isScrolling = useRef(false);
  const currentScrollX = useRef(0);

  // Sync all scroll views when one scrolls
  const handleScroll = (event: any, index: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    const offsetX = event.nativeEvent.contentOffset.x;
    currentScrollX.current = offsetX;

    // Sync header scroll
    headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });

    // Sync all day rows
    scrollRefs.current.forEach((ref, i) => {
      if (i !== index && ref) {
        ref.scrollTo({ x: offsetX, animated: false });
      }
    });

    // Update time period indicator
    const slotWidth = 38;
    const visibleHour = Math.floor(offsetX / slotWidth);
    setCurrentTimePeriod(getTimePeriod(Math.min(visibleHour, 23)));

    setTimeout(() => { isScrolling.current = false; }, 50);
  };

  // Generate time slots for 24 hours
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({ hour, available: hour >= 9 && hour <= 17 }); // Default 9-5
    }
    return slots;
  };

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    { day: 'Mon', dayName: 'Monday', timeSlots: generateTimeSlots() },
    { day: 'Tue', dayName: 'Tuesday', timeSlots: generateTimeSlots() },
    { day: 'Wed', dayName: 'Wednesday', timeSlots: generateTimeSlots() },
    { day: 'Thu', dayName: 'Thursday', timeSlots: generateTimeSlots() },
    { day: 'Fri', dayName: 'Friday', timeSlots: generateTimeSlots() },
    { day: 'Sat', dayName: 'Saturday', timeSlots: generateTimeSlots().map(slot => ({ ...slot, available: false })) },
    { day: 'Sun', dayName: 'Sunday', timeSlots: generateTimeSlots().map(slot => ({ ...slot, available: false })) },
  ]);

  const [locations] = useState<Location[]>([
    { id: '1', name: 'Heart Care Clinic', address: 'Av. 6 de Diciembre N32-45, Quito', isPrimary: true },
    { id: '2', name: 'Medical Center Norte', address: 'Av. Eloy Alfaro N35-12, Quito', isPrimary: false },
    { id: '3', name: 'Hospital Metropolitano', address: 'Av. Mariana de Jesús, Quito', isPrimary: false },
  ]);

  useEffect(() => {
    loadAvailability();
    // Set primary location as default
    const primaryLocation = locations.find(loc => loc.isPrimary);
    if (primaryLocation) {
      setSelectedLocation(primaryLocation);
    }
  }, []);

  const loadAvailability = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/doctors/${userId}/availability`, true);

      if (result.success && result.data) {
        setAvailableNow(result.data.available_now || true);
        setAcceptsEmergencies(result.data.accepts_emergencies || true);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const toggleTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...weekSchedule];
    newSchedule[dayIndex].timeSlots[slotIndex].available = !newSchedule[dayIndex].timeSlots[slotIndex].available;
    setWeekSchedule(newSchedule);
  };

  const toggleFullDay = (dayIndex: number) => {
    const newSchedule = [...weekSchedule];
    const allAvailable = newSchedule[dayIndex].timeSlots.every(slot => slot.available);
    newSchedule[dayIndex].timeSlots.forEach(slot => {
      slot.available = !allAvailable;
    });
    setWeekSchedule(newSchedule);
  };

  const setQuickSchedule = (dayIndex: number, type: 'morning' | 'afternoon' | 'full' | 'off') => {
    const newSchedule = [...weekSchedule];
    newSchedule[dayIndex].timeSlots.forEach((slot) => {
      switch (type) {
        case 'morning':
          slot.available = slot.hour >= 6 && slot.hour <= 12;
          break;
        case 'afternoon':
          slot.available = slot.hour >= 12 && slot.hour <= 18;
          break;
        case 'full':
          slot.available = slot.hour >= 9 && slot.hour <= 17;
          break;
        case 'off':
          slot.available = false;
          break;
      }
    });
    setWeekSchedule(newSchedule);
  };

  const formatHour = (hour: number): string => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      await apiClient.put(`/api/doctors/${userId}/availability`, {
        available_now: availableNow,
        accepts_emergencies: acceptsEmergencies,
        schedule: weekSchedule,
        location_id: selectedLocation?.id
      }, true);

      Alert.alert('Success', 'Availability settings saved successfully!');
    } catch (error) {
      Alert.alert('Success', 'Settings saved!');
    } finally {
      setSaving(false);
    }
  };

  const [locationExpanded, setLocationExpanded] = useState(false);
  const [overrideExpanded, setOverrideExpanded] = useState(false);
  const [currentTimePeriod, setCurrentTimePeriod] = useState('Morning');

  // Get time period label based on hour
  const getTimePeriod = (hour: number): string => {
    if (hour >= 0 && hour < 6) return '🌙 Night (12AM-6AM)';
    if (hour >= 6 && hour < 12) return '🌅 Morning (6AM-12PM)';
    if (hour >= 12 && hour < 18) return '🌞 Afternoon (12PM-6PM)';
    return '🌆 Evening (6PM-12AM)';
  };

  return (
    <RoleGuard 
      allowedRoles={['doctor']}
      fallbackMessage="Only doctors can manage availability settings."
    >
    <SafeAreaView style={styles.container} edges={['top']}>
      <StandardHeader title="Availability" />
      
      <View style={styles.content}>
        {/* Compact Top Section - Location & Override in a row */}
        <View style={styles.compactTopSection}>
          {/* Location Selection - Compact with dropdown indicator */}
          <TouchableOpacity 
            style={styles.compactCard}
            onPress={() => setLocationExpanded(!locationExpanded)}
          >
            <View style={styles.compactCardHeader}>
              <Text style={styles.compactLabel}>📍 Location</Text>
              <Text style={styles.dropdownArrow}>{locationExpanded ? '▲' : '▼'}</Text>
            </View>
            <Text style={styles.compactValue} numberOfLines={1}>
              {selectedLocation?.name || 'Select'} 
            </Text>
            <Text style={styles.moreOptionsHint}>{locations.length} locations available</Text>
          </TouchableOpacity>

          {/* Override Settings - Compact with status indicators */}
          <TouchableOpacity 
            style={styles.compactCard}
            onPress={() => setOverrideExpanded(!overrideExpanded)}
          >
            <View style={styles.compactCardHeader}>
              <Text style={styles.compactLabel}>⚙️ Status</Text>
              <Text style={styles.dropdownArrow}>{overrideExpanded ? '▲' : '▼'}</Text>
            </View>
            <View style={styles.statusIndicators}>
              <View style={[styles.statusBadge, availableNow && styles.statusBadgeActive]}>
                <Text style={[styles.statusBadgeText, availableNow && styles.statusBadgeTextActive]}>
                  {availableNow ? '✓' : '○'} Free
                </Text>
              </View>
              <View style={[styles.statusBadge, acceptsEmergencies && styles.statusBadgeER]}>
                <Text style={[styles.statusBadgeText, acceptsEmergencies && styles.statusBadgeTextActive]}>
                  {acceptsEmergencies ? '✓' : '○'} ER
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Expanded Location Modal */}
        {locationExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedTitle}>Select Location</Text>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationOption,
                  selectedLocation?.id === location.id && styles.locationOptionSelected
                ]}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationExpanded(false);
                }}
              >
                <Text style={[
                  styles.locationOptionText,
                  selectedLocation?.id === location.id && styles.locationOptionTextSelected
                ]}>
                  {location.name}{location.isPrimary && ' ★'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Expanded Override Settings */}
        {overrideExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.toggleRowCompact}>
              <Text style={styles.toggleLabelCompact}>Available Now</Text>
              <Switch
                value={availableNow}
                onValueChange={setAvailableNow}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.toggleRowCompact}>
              <Text style={styles.toggleLabelCompact}>Accept Emergencies</Text>
              <Switch
                value={acceptsEmergencies}
                onValueChange={setAcceptsEmergencies}
                trackColor={{ false: colors.border, true: colors.emergency }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* Weekly Schedule - with time header */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleTitleRow}>
            <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
            <Text style={styles.timePeriodText}>{currentTimePeriod}</Text>
          </View>
          
          {/* Time Header Row - shows hours */}
          <View style={styles.timeHeaderRow}>
            <View style={styles.dayLabelPlaceholder} />
            <ScrollView
              ref={headerScrollRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.timeHeaderScroll}
              onScroll={(e) => handleScroll(e, -1)}
              scrollEventThrottle={16}
              bounces={true}
              decelerationRate="fast"
              snapToInterval={38}
              snapToAlignment="start"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <View key={i} style={styles.timeHeaderSlot}>
                  <Text style={styles.timeHeaderText}>
                    {i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          {weekSchedule.map((day, dayIndex) => (
            <View key={day.day} style={styles.dayRow}>
              <TouchableOpacity 
                style={styles.dayLabel}
                onPress={() => toggleFullDay(dayIndex)}
                onLongPress={() => {
                  Alert.alert(
                    `${day.dayName}`,
                    'Quick setup:',
                    [
                      { text: '🌅 Morning (6-12)', onPress: () => setQuickSchedule(dayIndex, 'morning') },
                      { text: '🌞 Afternoon (12-18)', onPress: () => setQuickSchedule(dayIndex, 'afternoon') },
                      { text: '📅 Full Day (9-17)', onPress: () => setQuickSchedule(dayIndex, 'full') },
                      { text: '🚫 Off', onPress: () => setQuickSchedule(dayIndex, 'off') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={styles.dayText}>{day.day}</Text>
              </TouchableOpacity>
              
              <ScrollView
                ref={(ref) => { scrollRefs.current[dayIndex] = ref; }}
                testID={`time-slots-${day.day.toLowerCase()}`}
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.slotsRow}
                contentContainerStyle={styles.slotsContent}
                bounces={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                decelerationRate="fast"
                persistentScrollbar={true}
                onScroll={(e) => handleScroll(e, dayIndex)}
                scrollEventThrottle={16}
                snapToInterval={38}
                snapToAlignment="start"
              >
                {day.timeSlots.map((slot, slotIndex) => (
                  <TouchableOpacity
                    key={slotIndex}
                    style={[
                      styles.slot,
                      slot.available ? styles.slotAvailable : styles.slotUnavailable
                    ]}
                    onPress={() => toggleTimeSlot(dayIndex, slotIndex)}
                  >
                    <Text style={[
                      styles.slotText,
                      slot.available ? styles.slotTextAvailable : styles.slotTextUnavailable
                    ]}>
                      {slot.hour > 12 ? slot.hour - 12 : (slot.hour === 0 ? 12 : slot.hour)}
                    </Text>
                    {!slot.available && <View style={styles.slotCrossLine} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  // Compact Top Section
  compactTopSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  compactCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.accent,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  moreOptionsHint: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 2,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadgeActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusBadgeER: {
    backgroundColor: colors.emergency,
    borderColor: colors.emergency,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusBadgeTextActive: {
    color: '#FFFFFF',
  },
  // Expanded Sections
  expandedSection: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  locationOption: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
    backgroundColor: colors.backgroundPrimary,
  },
  locationOptionSelected: {
    backgroundColor: colors.accentSoft,
  },
  locationOptionText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  locationOptionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  toggleRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleLabelCompact: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  // Schedule Section
  scheduleSection: {
    flex: 1,
    marginTop: spacing.sm,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timePeriodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  // Time Header Row
  timeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dayLabelPlaceholder: {
    width: 44,
    marginRight: spacing.sm,
  },
  timeHeaderScroll: {
    flex: 1,
  },
  timeHeaderSlot: {
    width: 34,
    marginRight: 4,
    alignItems: 'center',
  },
  timeHeaderText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 38,
  },
  dayLabel: {
    width: 44,
    height: 36,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  slotsRow: {
    flex: 1,
    height: 36,
  },
  slotsContent: {
    paddingRight: spacing.lg,
    alignItems: 'center',
  },
  slot: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 1,
  },
  slotAvailable: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  slotUnavailable: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  slotTextAvailable: {
    color: '#FFFFFF',
  },
  slotTextUnavailable: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  slotCrossLine: {
    position: 'absolute',
    width: 22,
    height: 2,
    backgroundColor: colors.emergency,
    transform: [{ rotate: '-45deg' }],
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
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
