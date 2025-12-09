/**
 * TodayScheduleScreen - View today's appointment schedule
 * Used by: Medical Staff
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TodaySchedule'>;

interface ScheduleItem {
  id: string;
  time: string;
  patient_name: string;
  doctor_name: string;
  type: 'in_person' | 'virtual';
  status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'no_show';
  reason: string;
}

export default function TodayScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setSchedule([
        { id: '1', time: '09:00 AM', patient_name: 'John Doe', doctor_name: 'Dr. Garcia', type: 'in_person', status: 'completed', reason: 'Follow-up' },
        { id: '2', time: '09:30 AM', patient_name: 'Maria Santos', doctor_name: 'Dr. Garcia', type: 'in_person', status: 'in_progress', reason: 'Annual checkup' },
        { id: '3', time: '10:00 AM', patient_name: 'Carlos Rodriguez', doctor_name: 'Dr. Rodriguez', type: 'in_person', status: 'arrived', reason: 'Chest pain' },
        { id: '4', time: '10:30 AM', patient_name: 'Ana Martinez', doctor_name: 'Dr. Garcia', type: 'virtual', status: 'scheduled', reason: 'Prescription refill' },
        { id: '5', time: '11:00 AM', patient_name: 'Luis Fernandez', doctor_name: 'Dr. Rodriguez', type: 'in_person', status: 'scheduled', reason: 'New patient' },
        { id: '6', time: '11:30 AM', patient_name: 'Sofia Lopez', doctor_name: 'Dr. Garcia', type: 'in_person', status: 'scheduled', reason: 'Lab results review' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'arrived': return '#FFA500';
      case 'scheduled': return colors.textSecondary;
      case 'no_show': return colors.emergency;
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'IN PROGRESS';
      case 'no_show': return 'NO SHOW';
      default: return status.toUpperCase();
    }
  };

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.time}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>

      <View style={styles.detailsColumn}>
        <Text style={styles.patientName}>{item.patient_name}</Text>
        <Text style={styles.doctorName}>{item.doctor_name}</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>

        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, item.type === 'virtual' && styles.virtualBadge]}>
            <Text style={styles.typeText}>
              {item.type === 'virtual' ? '💻 Virtual' : '🏥 In-Person'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const stats = {
    total: schedule.length,
    completed: schedule.filter(s => s.status === 'completed').length,
    inProgress: schedule.filter(s => s.status === 'in_progress').length,
    waiting: schedule.filter(s => s.status === 'arrived').length,
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Today's Schedule</Text>
      </View>
    }>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.waiting}</Text>
          <Text style={styles.statLabel}>Waiting</Text>
        </View>
      </View>

      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No appointments today</Text>
            </View>
          }
        />
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dateHeader: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 70,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailsColumn: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  doctorName: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  virtualBadge: {
    backgroundColor: '#E3F2FD',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
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
  loadingContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
