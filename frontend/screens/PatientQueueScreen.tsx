/**
 * PatientQueueScreen - Manage waiting patient queue
 * Used by: Medical Staff
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PatientQueue'>;

interface QueueItem {
  id: string;
  position: number;
  patient_name: string;
  doctor_name: string;
  check_in_time: string;
  wait_time: string;
  priority: 'normal' | 'urgent';
  reason: string;
}

export default function PatientQueueScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    setQueue([
      { id: '1', position: 1, patient_name: 'Carlos Rodriguez', doctor_name: 'Dr. Rodriguez', check_in_time: '10:02 AM', wait_time: '15 min', priority: 'urgent', reason: 'Chest pain' },
      { id: '2', position: 2, patient_name: 'Maria Santos', doctor_name: 'Dr. Garcia', check_in_time: '09:45 AM', wait_time: '32 min', priority: 'normal', reason: 'Annual checkup' },
      { id: '3', position: 3, patient_name: 'Ana Martinez', doctor_name: 'Dr. Garcia', check_in_time: '10:15 AM', wait_time: '2 min', priority: 'normal', reason: 'Follow-up' },
    ]);
  };

  const handleCallPatient = (patient: QueueItem) => {
    Alert.alert(
      'Call Patient',
      `Call ${patient.patient_name} to ${patient.doctor_name}'s office?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Alert.alert('Patient Called', `${patient.patient_name} has been notified.`);
          }
        }
      ]
    );
  };

  const handleMarkNoShow = (patient: QueueItem) => {
    Alert.alert(
      'Mark No Show',
      `Mark ${patient.patient_name} as no-show?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setQueue(queue.filter(q => q.id !== patient.id));
          }
        }
      ]
    );
  };

  const renderQueueItem = ({ item }: { item: QueueItem }) => (
    <View style={[styles.queueCard, item.priority === 'urgent' && styles.urgentCard]}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>#{item.position}</Text>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.patientName}>{item.patient_name}</Text>
          {item.priority === 'urgent' && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.doctorName}>{item.doctor_name}</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>

        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Check-in: {item.check_in_time}</Text>
          <Text style={styles.waitTime}>Waiting: {item.wait_time}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallPatient(item)}
        >
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noShowButton}
          onPress={() => handleMarkNoShow(item)}
        >
          <Text style={styles.noShowButtonText}>No Show</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Patient Queue</Text>
      </View>
    }>
      {/* Queue Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{queue.length}</Text>
          <Text style={styles.statLabel}>Waiting</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.emergency }]}>
            {queue.filter(q => q.priority === 'urgent').length}
          </Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>~25</Text>
          <Text style={styles.statLabel}>Avg Wait (min)</Text>
        </View>
      </View>

      {/* Add to Queue Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CheckInPatient')}
      >
        <Text style={styles.addButtonText}>+ Check In New Patient</Text>
      </TouchableOpacity>

      {/* Queue List */}
      <FlatList
        data={queue}
        renderItem={renderQueueItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>No patients waiting</Text>
          </View>
        }
      />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statBox: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  queueCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.emergency,
  },
  positionBadge: {
    backgroundColor: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  positionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  urgentBadge: {
    backgroundColor: colors.emergency,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  waitTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actions: {
    justifyContent: 'space-between',
    marginLeft: spacing.sm,
  },
  callButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noShowButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.emergency,
  },
  noShowButtonText: {
    color: colors.emergency,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
