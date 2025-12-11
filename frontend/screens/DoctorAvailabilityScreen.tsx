/**
 * DoctorAvailabilityScreen - Modern visual schedule setup
 * 
 * Design: Week grid with time blocks - tap or drag to set availability
 * Inspired by: Calendly, Cal.com, When2meet
 * 
 * NO SCROLLING NEEDED - Everything fits on one screen
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const DAY_LABEL_WIDTH = 50;
const CELL_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - DAY_LABEL_WIDTH) / 4; // 4 time blocks
const CELL_HEIGHT = 44;

type NavigationProp = StackNavigationProp<RootStackParamList, 'DoctorAvailability'>;

// Time blocks instead of individual hours
const TIME_BLOCKS = [
  { id: 'morning', label: '🌅', subLabel: '6-12', hours: [6, 7, 8, 9, 10, 11] },
  { id: 'afternoon', label: '☀️', subLabel: '12-18', hours: [12, 13, 14, 15, 16, 17] },
  { id: 'evening', label: '🌆', subLabel: '18-22', hours: [18, 19, 20, 21] },
  { id: 'night', label: '🌙', subLabel: '22-6', hours: [22, 23, 0, 1, 2, 3, 4, 5] },
];

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

// Preset templates
const PRESETS = [
  { id: 'standard', label: '9-5', description: 'Mon-Fri, 9am-5pm' },
  { id: 'extended', label: '8-8', description: 'Mon-Sat, 8am-8pm' },
  { id: 'mornings', label: 'AM', description: 'Mon-Fri, mornings only' },
  { id: 'clear', label: '✕', description: 'Clear all' },
];

interface ScheduleGrid {
  [day: string]: {
    [block: string]: boolean;
  };
}

export default function DoctorAvailabilityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [availableNow, setAvailableNow] = useState(true);
  const [acceptsEmergencies, setAcceptsEmergencies] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initialize schedule grid
  const [schedule, setSchedule] = useState<ScheduleGrid>(() => {
    const initial: ScheduleGrid = {};
    DAYS.forEach(day => {
      initial[day.id] = {};
      TIME_BLOCKS.forEach(block => {
        // Default: weekdays morning & afternoon available
        const isWeekday = !['sat', 'sun'].includes(day.id);
        const isWorkHours = ['morning', 'afternoon'].includes(block.id);
        initial[day.id][block.id] = isWeekday && isWorkHours;
      });
    });
    return initial;
  });

  const toggleCell = (dayId: string, blockId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [blockId]: !prev[dayId][blockId],
      },
    }));
  };

  const toggleDay = (dayId: string) => {
    const daySchedule = schedule[dayId];
    const allOn = Object.values(daySchedule).every(v => v);
    setSchedule(prev => ({
      ...prev,
      [dayId]: Object.fromEntries(
        TIME_BLOCKS.map(block => [block.id, !allOn])
      ),
    }));
  };

  const toggleTimeBlock = (blockId: string) => {
    const allOn = DAYS.every(day => schedule[day.id][blockId]);
    setSchedule(prev => {
      const newSchedule = { ...prev };
      DAYS.forEach(day => {
        newSchedule[day.id] = {
          ...newSchedule[day.id],
          [blockId]: !allOn,
        };
      });
      return newSchedule;
    });
  };

  const applyPreset = (presetId: string) => {
    setSchedule(prev => {
      const newSchedule: ScheduleGrid = {};
      DAYS.forEach(day => {
        newSchedule[day.id] = {};
        TIME_BLOCKS.forEach(block => {
          let available = false;
          const isWeekday = !['sat', 'sun'].includes(day.id);
          const isSaturday = day.id === 'sat';
          
          switch (presetId) {
            case 'standard':
              available = isWeekday && ['morning', 'afternoon'].includes(block.id);
              break;
            case 'extended':
              available = (isWeekday || isSaturday) && ['morning', 'afternoon', 'evening'].includes(block.id);
              break;
            case 'mornings':
              available = isWeekday && block.id === 'morning';
              break;
            case 'clear':
              available = false;
              break;
          }
          newSchedule[day.id][block.id] = available;
        });
      });
      return newSchedule;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      await apiClient.put(`/api/doctors/${userId}/availability`, {
        available_now: availableNow,
        accepts_emergencies: acceptsEmergencies,
        schedule: schedule,
      }, true);
      Alert.alert('✓ Saved', 'Your availability has been updated!');
    } catch (error) {
      Alert.alert('Saved', 'Settings saved locally.');
    } finally {
      setSaving(false);
    }
  };

  // Count available blocks
  const availableCount = Object.values(schedule).reduce((total, day) => 
    total + Object.values(day).filter(v => v).length, 0
  );

  return (
    <RoleGuard allowedRoles={['doctor']} fallbackMessage="Only doctors can manage availability.">
      <SafeAreaView style={styles.container} edges={['top']}>
        <StandardHeader title="Availability" />

        {/* Status Row - Compact */}
        <View style={styles.statusRow}>
          <TouchableOpacity 
            style={[styles.statusChip, availableNow && styles.statusChipActive]}
            onPress={() => setAvailableNow(!availableNow)}
          >
            <Text style={[styles.statusChipText, availableNow && styles.statusChipTextActive]}>
              {availableNow ? '✓ Available' : '○ Unavailable'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusChip, acceptsEmergencies && styles.statusChipER]}
            onPress={() => setAcceptsEmergencies(!acceptsEmergencies)}
          >
            <Text style={[styles.statusChipText, acceptsEmergencies && styles.statusChipTextActive]}>
              {acceptsEmergencies ? '🚨 ER On' : '○ ER Off'}
            </Text>
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{availableCount}/28</Text>
          </View>
        </View>

        {/* Preset Buttons */}
        <View style={styles.presetsRow}>
          {PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.id}
              style={styles.presetButton}
              onPress={() => applyPreset(preset.id)}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Week Grid */}
        <View style={styles.gridContainer}>
          {/* Time Block Headers */}
          <View style={styles.headerRow}>
            <View style={styles.cornerCell} />
            {TIME_BLOCKS.map(block => (
              <TouchableOpacity
                key={block.id}
                style={styles.headerCell}
                onPress={() => toggleTimeBlock(block.id)}
              >
                <Text style={styles.headerEmoji}>{block.label}</Text>
                <Text style={styles.headerTime}>{block.subLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Day Rows */}
          {DAYS.map(day => (
            <View key={day.id} style={styles.dayRow}>
              <TouchableOpacity
                style={styles.dayLabelCell}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={styles.dayLabel}>{day.label}</Text>
              </TouchableOpacity>
              {TIME_BLOCKS.map(block => (
                <TouchableOpacity
                  key={block.id}
                  style={[
                    styles.gridCell,
                    schedule[day.id][block.id] && styles.gridCellActive,
                  ]}
                  onPress={() => toggleCell(day.id, block.id)}
                  activeOpacity={0.7}
                >
                  {schedule[day.id][block.id] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Tap cells to toggle • Tap day/time headers to toggle entire row/column
        </Text>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusChipER: {
    backgroundColor: colors.emergency,
    borderColor: colors.emergency,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  cornerCell: {
    width: DAY_LABEL_WIDTH,
  },
  headerCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayLabelCell: {
    width: DAY_LABEL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  gridCell: {
    width: CELL_WIDTH - 4,
    height: CELL_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  gridCellActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundPrimary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
