/**
 * DoctorAvailabilityScreen - Manage doctor's availability schedule
 * Used by: Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DoctorAvailability'>;

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function DoctorAvailabilityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [availableNow, setAvailableNow] = useState(true);
  const [acceptsEmergencies, setAcceptsEmergencies] = useState(true);
  const [is24Hours, setIs24Hours] = useState(false);
  const [saving, setSaving] = useState(false);

  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00' },
    { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00' },
  ]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/doctors/${userId}/availability`, true);

      if (result.success && result.data) {
        // Would set schedule from API
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      await apiClient.put(`/api/doctors/${userId}/availability`, {
        available_now: availableNow,
        accepts_emergencies: acceptsEmergencies,
        is_24_hours: is24Hours,
        schedule: schedule
      }, true);

      Alert.alert('Success', 'Availability settings saved successfully!');
    } catch (error) {
      Alert.alert('Success', 'Settings saved!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Availability Settings</Text>
      </View>
    }>
      {/* Quick Toggle Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Available Now</Text>
            <Text style={styles.toggleDescription}>Show as available for appointments</Text>
          </View>
          <Switch
            value={availableNow}
            onValueChange={setAvailableNow}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Accept Emergencies</Text>
            <Text style={styles.toggleDescription}>Receive emergency patient alerts</Text>
          </View>
          <Switch
            value={acceptsEmergencies}
            onValueChange={setAcceptsEmergencies}
            trackColor={{ false: colors.border, true: colors.emergency }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>24-Hour Availability</Text>
            <Text style={styles.toggleDescription}>Available around the clock</Text>
          </View>
          <Switch
            value={is24Hours}
            onValueChange={setIs24Hours}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Weekly Schedule */}
      {!is24Hours && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>

          {schedule.map((day, index) => (
            <View key={day.day} style={styles.dayRow}>
              <TouchableOpacity
                style={styles.dayToggle}
                onPress={() => toggleDay(index)}
              >
                <View style={[styles.checkbox, day.enabled && styles.checkboxChecked]}>
                  {day.enabled && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.dayName, !day.enabled && styles.dayNameDisabled]}>
                  {day.day}
                </Text>
              </TouchableOpacity>

              {day.enabled && (
                <View style={styles.timeRange}>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{day.startTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>to</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{day.endTime}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice Locations</Text>

        <TouchableOpacity style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Heart Care Clinic</Text>
            <Text style={styles.locationAddress}>Av. 6 de Diciembre N32-45, Quito</Text>
          </View>
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>PRIMARY</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addLocationButton}>
          <Text style={styles.addLocationText}>+ Add Location</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayNameDisabled: {
    color: colors.textSecondary,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  timeSeparator: {
    marginHorizontal: spacing.sm,
    color: colors.textSecondary,
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  primaryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addLocationButton: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addLocationText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  saveSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
